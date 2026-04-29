import { describe, it, expect } from "vitest";
import { listMembers } from "../list-members";
import { getMemberScans } from "../get-member-scans";
import type { ToolResult } from "@/lib/membergpt/tool-result";

type ScanRow = { id: string; member_id: string; scan_date: string; [key: string]: unknown };
type MemberRow = { id: string; scan_count: number; [key: string]: unknown };

const opts = { toolCallId: "test", messages: [] as [] };

async function callListMembers(
  input: Parameters<NonNullable<typeof listMembers.execute>>[0],
): Promise<ToolResult<MemberRow[]>> {
  return (await listMembers.execute!(input, opts)) as unknown as ToolResult<MemberRow[]>;
}

async function callGetMemberScans(
  input: Parameters<NonNullable<typeof getMemberScans.execute>>[0],
): Promise<ToolResult<ScanRow[]>> {
  return (await getMemberScans.execute!(input, opts)) as unknown as ToolResult<ScanRow[]>;
}

describe("get_member_scans", () => {
  it("returns no_data for a UUID with no scans", async () => {
    const result = await callGetMemberScans({
      member_id: "00000000-0000-0000-0000-000000000001",
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected fail result");
    expect(result.reason).toBe("no_data");
  });

  it("returns ok with scan rows for a real member", async () => {
    const listResult = await callListMembers({ min_scan_count: 1 });
    if (!listResult.ok || listResult.data.length === 0) return;

    const memberId = listResult.data[0].id;
    const result = await callGetMemberScans({ member_id: memberId });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  it("returns scans in chronological ascending order", async () => {
    const listResult = await callListMembers({ min_scan_count: 2 });
    if (!listResult.ok || listResult.data.length === 0) return;

    const memberId = listResult.data[0].id;
    const result = await callGetMemberScans({ member_id: memberId });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");

    const dates = result.data.map((s) => s.scan_date);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] >= dates[i - 1]).toBe(true);
    }
  });

  it("each scan row has required fields", async () => {
    const listResult = await callListMembers({ min_scan_count: 1 });
    if (!listResult.ok || listResult.data.length === 0) return;

    const memberId = listResult.data[0].id;
    const result = await callGetMemberScans({ member_id: memberId });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");

    const scan = result.data[0];
    expect(typeof scan.id).toBe("string");
    expect(typeof scan.member_id).toBe("string");
    expect(typeof scan.scan_date).toBe("string");
  });

  it("respects the limit parameter", async () => {
    const listResult = await callListMembers({ min_scan_count: 2 });
    if (!listResult.ok || listResult.data.length === 0) return;

    const memberId = listResult.data[0].id;
    const result = await callGetMemberScans({ member_id: memberId, limit: 1 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.data.length).toBeLessThanOrEqual(1);
  });
});
