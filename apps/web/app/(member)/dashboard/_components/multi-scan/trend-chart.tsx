"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DataPoint {
  label: string;
  value: number | null;
}

interface TrendChartProps {
  title: string;
  unit: string;
  data: DataPoint[];
  deltaLabel?: string;
  deltaImproved?: boolean | null;
  goalBaseline?: number;
  decimals?: number;
}

const CHART_CONFIG: ChartConfig = {
  value: { label: "Value", color: "#1D4ED8" },
};

export function TrendChart({
  title,
  unit,
  data,
  deltaLabel,
  deltaImproved,
  goalBaseline,
  decimals = 1,
}: TrendChartProps) {
  const values = data.filter((d) => d.value !== null).map((d) => d.value as number);
  const hasData = values.length > 0;
  const min = hasData ? Math.min(...values) : 0;
  const max = hasData ? Math.max(...values) : 1;
  const range = max - min;
  const pad = range * 0.15 || 0.5;
  const domainMin = min - pad;
  const domainMax = max + pad;

  const deltaColor =
    deltaImproved === true
      ? "text-green-600 bg-green-50"
      : deltaImproved === false
        ? "text-red-600 bg-red-50"
        : "text-neutral-500 bg-neutral-100";

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-black">{title}</h3>
          {deltaLabel !== undefined && (
            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${deltaColor}`}>
              {deltaLabel} first → latest
            </span>
          )}
        </div>
        <span className="text-xs text-neutral-400 mt-0.5">{unit}</span>
      </div>
      <ChartContainer config={CHART_CONFIG} className="h-[200px] w-full">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#a3a3a3" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#a3a3a3" }}
            tickFormatter={(v: number) => v.toFixed(decimals)}
            width={44}
          />
          {goalBaseline !== undefined && (
            <ReferenceLine
              y={goalBaseline}
              stroke="#1D4ED8"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              label={{
                value: "Baseline",
                position: "insideTopRight",
                fontSize: 10,
                fill: "#1D4ED8",
                fillOpacity: 0.6,
              }}
            />
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(v) => `${(v as number).toFixed(decimals)} ${unit}`}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1D4ED8"
            strokeWidth={2}
            dot={{ r: 4, fill: "#1D4ED8", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#1D4ED8" }}
            connectNulls={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
