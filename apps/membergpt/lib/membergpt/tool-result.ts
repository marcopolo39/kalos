export type ToolResult<T> =
  | { ok: true; data: T; hint?: string }
  | {
      ok: false;
      reason: "not_found" | "no_data" | "invalid_input";
      message: string;
    };

export function ok<T>(data: T, hint?: string): ToolResult<T> {
  return hint ? { ok: true, data, hint } : { ok: true, data };
}

export function fail(
  reason: "not_found" | "no_data" | "invalid_input",
  message: string,
): ToolResult<never> {
  return { ok: false, reason, message };
}
