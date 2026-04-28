import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kalos/supabase";
import { EmptyState } from "./_components/empty-state";
import { FirstScanView } from "./_components/first-scan-view";

async function getDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const [{ data: scans }, { data: member }] = await Promise.all([
    supabase
      .from("scans")
      .select("id, scan_date, tbf_pct, tbf_pct_pctile_am, almi, almi_pctile_am, vat_area_cm2")
      .eq("member_id", userId)
      .order("scan_date", { ascending: false })
      .limit(2),
    supabase.from("members").select("name, sex").eq("id", userId).single(),
  ]);

  return {
    scanCount: scans?.length ?? 0,
    latestScan: scans?.[0] ?? null,
    memberName: member?.name ?? "there",
    memberSex: member?.sex ?? "unknown",
  };
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

  const { scanCount, latestScan, memberName, memberSex } = await getDashboardData(
    supabase,
    session.user.id,
  );

  if (scanCount === 0) {
    return <EmptyState memberName={memberName} />;
  }

  if (scanCount === 1 && latestScan) {
    return <FirstScanView scan={latestScan} sex={memberSex} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-black">Dashboard coming soon</h1>
      <p className="text-neutral-500">Your scan data will appear here.</p>
    </div>
  );
}
