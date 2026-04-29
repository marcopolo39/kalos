import { tool } from "ai";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { ok, fail } from "@/lib/membergpt/tool-result";

export const getMemberGoals = tool({
  description:
    "Retrieve structured goal objects for a member. Returns ok: false with reason no_data if no goals have been set.",
  inputSchema: z.object({
    member_id: z.string().uuid().describe("UUID of the member"),
  }),
  execute: async ({ member_id }) => {
    const supabase = createServiceClient();

    const { data: goals, error } = await supabase
      .from("member_goals")
      .select("*")
      .eq("member_id", member_id);

    if (error) return fail("invalid_input", error.message);
    if (!goals || goals.length === 0)
      return fail("no_data", "No goals have been set for this member.");

    return ok(goals);
  },
});
