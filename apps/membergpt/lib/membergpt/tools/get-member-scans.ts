import { tool } from "ai";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { ok, fail } from "@/lib/membergpt/tool-result";

export const getMemberScans = tool({
  description:
    "Retrieve DEXA scan rows for a member in chronological ascending order. Use the member id from list_members.",
  inputSchema: z.object({
    member_id: z.string().uuid().describe("UUID of the member"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum scans to return (default 20, max 50)"),
  }),
  execute: async ({ member_id, limit }) => {
    const supabase = createServiceClient();

    const { data: scans, error } = await supabase
      .from("scans")
      .select("*")
      .eq("member_id", member_id)
      .order("scan_date", { ascending: true })
      .limit(limit ?? 20);

    if (error) return fail("invalid_input", error.message);
    if (!scans || scans.length === 0)
      return fail("no_data", `No scans found for member ${member_id}.`);

    return ok(scans);
  },
});
