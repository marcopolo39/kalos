/**
 * Acceptance-criteria proof: a typed query that compiles with full Database generics.
 * Not imported at runtime — run `tsc --noEmit` in packages/db to exercise it.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types";

type LatestScanRow = Pick<
  Database["public"]["Tables"]["scans"]["Row"],
  "id" | "scan_date" | "tbf_pct"
>;

export async function getLatestScan(
  supabase: SupabaseClient<Database>,
  memberId: string,
): Promise<LatestScanRow | null> {
  const { data, error } = await supabase
    .from("scans")
    .select("id, scan_date, tbf_pct")
    .eq("member_id", memberId)
    .order("scan_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
