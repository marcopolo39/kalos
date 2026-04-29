import { tool } from "ai";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { ok, fail } from "@/lib/membergpt/tool-result";

function computeAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const listMembers = tool({
  description:
    "List members, optionally filtered by name substring, sex, or scan count. Returns up to 50 results. Call this first to resolve a member name to an id.",
  inputSchema: z.object({
    name_query: z
      .string()
      .optional()
      .describe("Case-insensitive substring to match against member name"),
    sex: z
      .string()
      .optional()
      .describe("Filter by sex: 'male' or 'female'"),
    min_scan_count: z
      .number()
      .int()
      .optional()
      .describe("Only include members with at least this many scans"),
    max_scan_count: z
      .number()
      .int()
      .optional()
      .describe("Only include members with at most this many scans"),
  }),
  execute: async ({ name_query, sex, min_scan_count, max_scan_count }) => {
    const supabase = createServiceClient();

    let query = supabase
      .from("members")
      .select("id, name, sex, dob")
      .limit(200);

    if (name_query) {
      query = query.ilike("name", `%${name_query}%`);
    }
    if (sex) {
      query = query.eq("sex", sex);
    }

    const { data: memberRows, error } = await query;
    if (error) return fail("invalid_input", error.message);
    if (!memberRows || memberRows.length === 0) return ok([]);

    const memberIds = memberRows.map((m) => m.id);

    const [{ data: scanRows }, { data: goalRows }] = await Promise.all([
      supabase
        .from("scans")
        .select("member_id, scan_date")
        .in("member_id", memberIds),
      supabase
        .from("member_goals")
        .select("member_id")
        .in("member_id", memberIds),
    ]);

    const scansByMember = new Map<string, string[]>();
    for (const s of scanRows ?? []) {
      const dates = scansByMember.get(s.member_id) ?? [];
      dates.push(s.scan_date);
      scansByMember.set(s.member_id, dates);
    }

    const membersWithGoals = new Set(
      (goalRows ?? []).map((g) => g.member_id),
    );

    const result = memberRows
      .map((m) => {
        const dates = scansByMember.get(m.id) ?? [];
        const latestDate =
          dates.length > 0
            ? dates.reduce((a, b) => (a > b ? a : b))
            : null;
        return {
          id: m.id,
          name: m.name,
          sex: m.sex,
          age: computeAge(m.dob),
          scan_count: dates.length,
          latest_scan_date: latestDate,
          has_goals: membersWithGoals.has(m.id),
        };
      })
      .filter((m) => {
        if (min_scan_count !== undefined && m.scan_count < min_scan_count)
          return false;
        if (max_scan_count !== undefined && m.scan_count > max_scan_count)
          return false;
        return true;
      })
      .slice(0, 50);

    return ok(result);
  },
});
