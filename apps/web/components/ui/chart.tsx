"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChartContext() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChartContext must be used inside ChartContainer");
  return ctx;
}

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ config, children, className }: ChartContainerProps) {
  const cssVars = Object.entries(config).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[`--color-${key}`] = value.color;
      return acc;
    },
    {},
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={className} style={cssVars as React.CSSProperties}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip {...props} />;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  dataKey: string;
  color?: string;
}

interface TooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  formatter?: (value: number, name: string) => string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: TooltipContentProps) {
  const { config } = useChartContext();

  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-3 text-sm min-w-[140px]">
      {label && <p className="text-neutral-500 text-xs mb-2">{label}</p>}
      <div className="flex flex-col gap-1">
        {payload.map((entry) => {
          const cfg = config[entry.dataKey];
          const displayName = cfg?.label ?? entry.name;
          const displayValue = formatter
            ? formatter(entry.value, entry.dataKey)
            : entry.value.toFixed(1);
          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: entry.color ?? cfg?.color }}
              />
              <span className="text-neutral-600">{displayName}</span>
              <span className="ml-auto font-medium text-neutral-900">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
