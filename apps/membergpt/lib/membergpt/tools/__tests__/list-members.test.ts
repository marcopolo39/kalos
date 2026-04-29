import { describe, it, expect } from "vitest";
import { listMembers } from "../list-members";
import type { ToolResult } from "@/lib/membergpt/tool-result";

type MemberRow = {
  id: string;
  name: string;
  sex: string;
  age: number;
  scan_count: number;
  latest_scan_date: string | null;
  has_goals: boolean;
};

const opts = { toolCallId: "test", messages: [] as [] };

async function callListMembers(
  input: Parameters<NonNullable<typeof listMembers.execute>>[0],
): Promise<ToolResult<MemberRow[]>> {
  return (await listMembers.execute!(input, opts)) as unknown as ToolResult<MemberRow[]>;
}

describe("list_members", () => {
  it("returns ok with an array of members", async () => {
    const result = await callListMembers({});
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeLessThanOrEqual(50);
  });

  it("returns at most 50 results regardless of db size", async () => {
    const result = await callListMembers({});
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.data.length).toBeLessThanOrEqual(50);
  });

  it("filters by name_query case-insensitively", async () => {
    const result = await callListMembers({ name_query: "sarah" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    for (const m of result.data) {
      expect(m.name.toLowerCase()).toContain("sarah");
    }
  });

  it("filters by min_scan_count", async () => {
    const result = await callListMembers({ min_scan_count: 3 });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    for (const m of result.data) {
      expect(m.scan_count).toBeGreaterThanOrEqual(3);
    }
  });

  it("each member row has the expected shape", async () => {
    const result = await callListMembers({});
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    if (result.data.length === 0) return;
    const m = result.data[0];
    expect(typeof m.id).toBe("string");
    expect(typeof m.name).toBe("string");
    expect(typeof m.sex).toBe("string");
    expect(typeof m.age).toBe("number");
    expect(typeof m.scan_count).toBe("number");
    expect(typeof m.has_goals).toBe("boolean");
  });

  it("returns empty array for a name that does not exist", async () => {
    const result = await callListMembers({ name_query: "zzznomatchxxx" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.data).toHaveLength(0);
  });
});
