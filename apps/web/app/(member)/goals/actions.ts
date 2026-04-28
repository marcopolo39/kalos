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

  const { error } = await supabase.from("member_goals").insert({
    member_id: session.user.id,
    metrics: parsed.data.metrics,
  });

  if (error) {
    return { error: "Failed to save goals. Please try again." };
  }

  redirect("/dashboard");
}
