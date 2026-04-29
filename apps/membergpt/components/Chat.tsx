"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolCallPill } from "@/components/ToolCallPill";
import { ToolCallDetails } from "@/components/ToolCallDetails";

function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-3 text-sm leading-relaxed text-neutral-900 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-neutral-900">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="mb-3 ml-4 list-disc space-y-1 text-sm text-neutral-900">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 ml-4 list-decimal space-y-1 text-sm text-neutral-900">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h1: ({ children }) => (
          <h1 className="mb-2 text-base font-semibold text-neutral-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 text-sm font-semibold text-neutral-700">{children}</h3>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <pre className="mb-3 overflow-x-auto rounded-lg bg-neutral-50 p-3 text-xs text-neutral-800">
                <code>{children}</code>
              </pre>
            );
          }
          return (
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs text-neutral-800">
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="mb-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-neutral-200 last:border-0">{children}</tr>,
        th: ({ children }) => (
          <th className="bg-neutral-50 px-3 py-2 text-left text-xs font-semibold text-neutral-700 border border-neutral-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-neutral-900 align-top border border-neutral-200">{children}</td>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-2 border-neutral-300 pl-3 text-sm italic text-neutral-600">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-neutral-200" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export function Chat() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const stableId = useId();
  const { messages, sendMessage, status, error, clearError } = useChat({ id: stableId });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">
            Ask anything about your members&apos; scans and goals.
          </p>
        )}

        <div className="mx-auto max-w-2xl space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[80%] rounded-2xl bg-black px-4 py-3 text-sm text-white"
                    : "max-w-[90%] space-y-2"
                }
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    if (message.role === "user") {
                      return (
                        <p key={i} className="whitespace-pre-wrap leading-relaxed">
                          {part.text}
                        </p>
                      );
                    }
                    return (
                      <MarkdownMessage key={i} text={part.text} />
                    );
                  }

                  if (part.type.startsWith("tool-")) {
                    const p = part as {
                      type: string;
                      state: string;
                      toolCallId: string;
                      input?: unknown;
                      output?: unknown;
                      errorText?: string;
                    };
                    const showDetails =
                      p.state === "output-available" || p.state === "output-error";
                    return (
                      <div key={i}>
                        <ToolCallPill
                          toolType={part.type}
                          state={p.state}
                          output={p.output}
                        />
                        {showDetails && (
                          <ToolCallDetails
                            toolName={part.type.replace(/^tool-/, "")}
                            input={p.input}
                            output={p.output}
                            errorText={p.errorText}
                          />
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          <span>Something went wrong: {error.message}</span>
          <button
            onClick={clearError}
            className="ml-4 text-red-400 hover:text-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="border-t border-neutral-200 bg-white px-4 py-3">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a member's scans, trends, or goals…"
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || status === "submitted" || status === "streaming"}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
