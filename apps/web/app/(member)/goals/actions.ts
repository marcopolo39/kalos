"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const GoalMetricSchema = z.object({
  metric: z.enum(["tbf_pct", "almi", "vat_area_cm2", "weight_lb"]),
  direction: z.enum(["decrease", "increase", "maintain"]),
});

const GoalFormSchema = z.object({
  metrics: z.array(GoalMetricSchema).min(1),
});

export async function saveGoal(
  formData: FormData,
): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  const rawMetrics = formData.get("metrics");
  if (typeof rawMetrics !== "string") {
    return { error: "Invalid submission." };
  }

  let parsed: ReturnType<typeof GoalFormSchema.safeParse>;
  try {
    parsed = GoalFormSchema.safeParse({ metrics: JSON.parse(rawMetrics) });
  } catch {
    return { error: "Invalid submission." };
  }

  if (!parsed.success) {
    return { error: "Select at least one metric." };
  }

  // Fetch most recent scan values for baselines
  const { data: latestScan } = await supabase
    .from("scans")
    .select("tbf_pct, almi, vat_area_cm2, weight_lb")
    .eq("member_id", session.user.id)
    .order("scan_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const scanValues: Record<string, number | null> = {
    tbf_pct: latestScan?.tbf_pct ?? null,
    almi: latestScan?.almi ?? null,
    vat_area_cm2: latestScan?.vat_area_cm2 ?? null,
    weight_lb: latestScan?.weight_lb ?? null,
  };

  const metricsWithBaseline = parsed.data.metrics.map((m) => {
    const baseline = scanValues[m.metric];
    return baseline !== null ? { ...m, baseline_value: baseline } : m;
  });

  const { error } = await supabase.from("member_goals").insert({
    member_id: session.user.id,
    metrics: metricsWithBaseline,
  });

  if (error) {
    return { error: "Failed to save goals. Please try again." };
  }

  redirect("/dashboard");
}
