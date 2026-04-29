import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/membergpt/system-prompt";
import { tools } from "@/lib/membergpt/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
