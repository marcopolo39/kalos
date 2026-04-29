"use client";

interface ToolResult {
  ok: boolean;
  data?: unknown[];
  reason?: string;
  message?: string;
}

const TOOL_CONFIG: Record<
  string,
  {
    running: string;
    done: (output: ToolResult | undefined) => string;
  }
> = {
  list_members: {
    running: "Searching for members…",
    done: (output) => {
      if (!output?.ok || !Array.isArray(output.data)) return "✓ Done";
      const n = output.data.length;
      return `✓ ${n} member${n === 1 ? "" : "s"}`;
    },
  },
  get_member_scans: {
    running: "Fetching scan history…",
    done: (output) => {
      if (!output?.ok || !Array.isArray(output.data)) return "✓ No scans";
      const n = output.data.length;
      return `✓ ${n} scan${n === 1 ? "" : "s"}`;
    },
  },
  get_member_goals: {
    running: "Loading goals…",
    done: (output) => {
      if (!output?.ok) return "✓ No goals set";
      return "✓ Goals loaded";
    },
  },
};

interface Props {
  toolType: string;
  state: string;
  output?: unknown;
}

export function ToolCallPill({ toolType, state, output }: Props) {
  const toolName = toolType.replace(/^tool-/, "");
  const config = TOOL_CONFIG[toolName];
  const isDone = state === "output-available";
  const isError = state === "output-error";

  const label = config
    ? isError
      ? "⚠ Tool error"
      : isDone
        ? config.done(output as ToolResult | undefined)
        : config.running
    : isError
      ? "⚠ Tool error"
      : isDone
        ? "✓ Done"
        : `Calling ${toolName}…`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${
        isError
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-neutral-200 bg-neutral-50 text-neutral-600"
      }`}
    >
      {!isDone && !isError && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
      )}
      {label}
    </span>
  );
}
