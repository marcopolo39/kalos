"use client";

interface Props {
  toolName: string;
  input: unknown;
  output: unknown;
  errorText?: string;
}

export function ToolCallDetails({ toolName, input, output, errorText }: Props) {
  return (
    <details className="mt-1">
      <summary className="cursor-pointer select-none text-xs text-neutral-400 hover:text-neutral-600">
        Tool details: {toolName}
      </summary>
      <div className="mt-1 overflow-x-auto rounded border border-neutral-200 bg-neutral-50 p-2 font-mono text-xs text-neutral-700">
        <p className="font-semibold text-neutral-500">Input</p>
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(input, null, 2)}
        </pre>
        {errorText ? (
          <>
            <p className="mt-2 font-semibold text-red-500">Error</p>
            <pre className="whitespace-pre-wrap break-words text-red-600">{errorText}</pre>
          </>
        ) : (
          <>
            <p className="mt-2 font-semibold text-neutral-500">Output</p>
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(output, null, 2)}
            </pre>
          </>
        )}
      </div>
    </details>
  );
}
