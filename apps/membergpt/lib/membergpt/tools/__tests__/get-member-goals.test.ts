import { describe, it, expect } from "vitest";
import { listMembers } from "../list-members";
import { getMemberGoals } from "../get-member-goals";
import type { ToolResult } from "@/lib/membergpt/tool-result";

type GoalRow = {
  id: string;
  member_id: string;
  metrics: { metric: string; direction: string }[];
};
type MemberRow = { id: string; has_goals: boolean; [key: string]: unknown };

const opts = { toolCallId: "test", messages: [] as [] };

async function callListMembers(
  input: Parameters<NonNullable<typeof listMembers.execute>>[0],
): Promise<ToolResult<MemberRow[]>> {
  return (await listMembers.execute!(input, opts)) as unknown as ToolResult<MemberRow[]>;
}

async function callGetMemberGoals(
  input: Parameters<NonNullable<typeof getMemberGoals.execute>>[0],
): Promise<ToolResult<GoalRow[]>> {
  return (await getMemberGoals.execute!(input, opts)) as unknown as ToolResult<GoalRow[]>;
}

describe("get_member_goals", () => {
  it("returns no_data for a UUID with no goals", async () => {
    const result = await callGetMemberGoals({
      member_id: "00000000-0000-0000-0000-000000000002",
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected fail result");
    expect(result.reason).toBe("no_data");
  });

  it("returns ok with goals for a member that has goals", async () => {
    const listResult = await callListMembers({});
    if (!listResult.ok) return;

    const memberWithGoals = listResult.data.find((m) => m.has_goals);
    if (!memberWithGoals) return;

    const result = await callGetMemberGoals({ member_id: memberWithGoals.id });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  it("each goal row has id, member_id, and metrics", async () => {
    const listResult = await callListMembers({});
    if (!listResult.ok) return;

    const memberWithGoals = listResult.data.find((m) => m.has_goals);
    if (!memberWithGoals) return;

    const result = await callGetMemberGoals({ member_id: memberWithGoals.id });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");

    const goal = result.data[0];
    expect(typeof goal.id).toBe("string");
    expect(typeof goal.member_id).toBe("string");
    expect(Array.isArray(goal.metrics)).toBe(true);
  });

  it("metrics contain valid metric and direction fields", async () => {
    const listResult = await callListMembers({});
    if (!listResult.ok) return;

    const memberWithGoals = listResult.data.find((m) => m.has_goals);
    if (!memberWithGoals) return;

    const result = await callGetMemberGoals({ member_id: memberWithGoals.id });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");

    const VALID_METRICS = ["tbf_pct", "almi", "vat_area_cm2", "weight_lb"];
    const VALID_DIRECTIONS = ["decrease", "increase", "maintain"];

    for (const m of result.data[0].metrics) {
      expect(VALID_METRICS).toContain(m.metric);
      expect(VALID_DIRECTIONS).toContain(m.direction);
    }
  });
});
