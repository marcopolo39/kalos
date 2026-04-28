import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kalos/supabase";
import type { MemberSex } from "@/lib/scan-display/types";
import { EmptyState } from "./_components/empty-state";
import { FirstScanView } from "./_components/first-scan-view";
import { SecondScanView } from "./_components/second-scan/second-scan-view";
import { MultiScanView } from "./_components/multi-scan/multi-scan-view";

const GoalMetricSchema = z.object({
  metric: z.enum(["tbf_pct", "almi", "vat_area_cm2", "weight_lb"]),
  direction: z.enum(["decrease", "increase", "maintain"]),
  baseline_value: z.number().optional(),
  target_value: z.number().optional(),
});
const GoalRowSchema = z.object({
  metrics: z.array(GoalMetricSchema).default([]),
});

const SCAN_FIELDS =
  "id, scan_date, tbf_pct, tbf_pct_pctile_am, almi, almi_pctile_am, vat_area_cm2, weight_lb, total_bmd, total_t_score, total_lean_mass, total_fat_mass, l_arm_lean_mass, l_arm_fat_mass, r_arm_lean_mass, r_arm_fat_mass, trunk_lean_mass, trunk_fat_mass, l_leg_lean_mass, l_leg_fat_mass, r_leg_lean_mass, r_leg_fat_mass, source_pdf_path";

async function getDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const [{ data: scans, count }, { data: member }, { data: goals }] =
    await Promise.all([
      supabase
        .from("scans")
        .select(SCAN_FIELDS, { count: "exact" })
        .eq("member_id", userId)
        .order("scan_date", { ascending: false }),
      supabase.from("members").select("name, sex").eq("id", userId).single(),
      supabase
        .from("member_goals")
        .select("metrics")
        .eq("member_id", userId),
    ]);

  const sex = member?.sex;
  return {
    scanCount: count ?? 0,
    scans: scans ?? [],
    memberName: member?.name ?? "there",
    memberSex: (sex === "male" || sex === "female" ? sex : "male") as MemberSex,
    goals: (goals ?? []).flatMap((row) => {
      const result = GoalRowSchema.safeParse(row);
      return result.success ? [result.data] : [];
    }),
  };
}

async function generateSignedUrls(
  supabase: SupabaseClient<Database>,
  scans: Array<{ id: string; source_pdf_path: string | null }>,
): Promise<Record<string, string>> {
  const withPdfs = scans.filter(
    (s): s is typeof s & { source_pdf_path: string } => s.source_pdf_path !== null,
  );
  if (withPdfs.length === 0) return {};

  const entries = await Promise.all(
    withPdfs.map(async (scan) => {
      const { data } = await supabase.storage
        .from("scans")
        .createSignedUrl(scan.source_pdf_path, 300);
      return data?.signedUrl ? ([scan.id, data.signedUrl] as const) : null;
    }),
  );

  return Object.fromEntries(entries.filter((e): e is [string, string] => e !== null));
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Middleware already validates/refreshes auth with getUser on /dashboard.
  // Read session locally here to avoid a second network call per request.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { scanCount, scans, memberName, memberSex, goals } =
    await getDashboardData(supabase, session.user.id);

  if (scanCount === 0) {
    return <EmptyState memberName={memberName} />;
  }

  if (scanCount === 1 && scans[0]) {
    return (
      <FirstScanView
        scan={scans[0]}
        sex={memberSex}
        hasGoal={goals.length > 0}
      />
    );
  }

  if (scanCount === 2 && scans[0] && scans[1]) {
    return (
      <SecondScanView
        current={scans[0]}
        previous={scans[1]}
        goals={goals}
        sex={memberSex}
      />
    );
  }

  if (scanCount >= 3) {
    const signedUrls = await generateSignedUrls(supabase, scans);
    return (
      <MultiScanView
        scans={scans}
        goals={goals}
        memberName={memberName}
        signedUrls={signedUrls}
      />
    );
  }

  return null;
}
