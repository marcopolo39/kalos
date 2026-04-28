"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface RegionalScan {
  l_arm_lean_mass: number | null;
  l_arm_fat_mass: number | null;
  r_arm_lean_mass: number | null;
  r_arm_fat_mass: number | null;
  trunk_lean_mass: number | null;
  trunk_fat_mass: number | null;
  l_leg_lean_mass: number | null;
  l_leg_fat_mass: number | null;
  r_leg_lean_mass: number | null;
  r_leg_fat_mass: number | null;
}

interface RegionalComparisonChartProps {
  previous: RegionalScan;
  current: RegionalScan;
  previousDate: string;
  currentDate: string;
}

const CHART_CONFIG: ChartConfig = {
  previous: { label: "Scan 1", color: "#0a0a0a" },
  current: { label: "Scan 2", color: "#3b82f6" },
};

function fmt(v: number | null): number {
  return v ?? 0;
}

function buildLeanData(prev: RegionalScan, curr: RegionalScan) {
  return [
    { region: "L Arm", previous: fmt(prev.l_arm_lean_mass), current: fmt(curr.l_arm_lean_mass) },
    { region: "R Arm", previous: fmt(prev.r_arm_lean_mass), current: fmt(curr.r_arm_lean_mass) },
    { region: "Trunk", previous: fmt(prev.trunk_lean_mass), current: fmt(curr.trunk_lean_mass) },
    { region: "L Leg", previous: fmt(prev.l_leg_lean_mass), current: fmt(curr.l_leg_lean_mass) },
    { region: "R Leg", previous: fmt(prev.r_leg_lean_mass), current: fmt(curr.r_leg_lean_mass) },
  ];
}

function buildFatData(prev: RegionalScan, curr: RegionalScan) {
  return [
    { region: "L Arm", previous: fmt(prev.l_arm_fat_mass), current: fmt(curr.l_arm_fat_mass) },
    { region: "R Arm", previous: fmt(prev.r_arm_fat_mass), current: fmt(curr.r_arm_fat_mass) },
    { region: "Trunk", previous: fmt(prev.trunk_fat_mass), current: fmt(curr.trunk_fat_mass) },
    { region: "L Leg", previous: fmt(prev.l_leg_fat_mass), current: fmt(curr.l_leg_fat_mass) },
    { region: "R Leg", previous: fmt(prev.r_leg_fat_mass), current: fmt(curr.r_leg_fat_mass) },
  ];
}

interface MiniChartProps {
  data: { region: string; previous: number; current: number }[];
  title: string;
}

function RegionChart({ data, title }: MiniChartProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
        {title}
      </p>
      <ChartContainer config={CHART_CONFIG} className="h-[200px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 40 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f5f5f5" />
          <YAxis
            dataKey="region"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#737373" }}
            width={36}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#a3a3a3" }}
            tickFormatter={(v: number) => `${v}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(v) => `${v.toFixed(1)} lb`}
              />
            }
          />
          <Bar dataKey="previous" fill="var(--color-previous)" radius={2} />
          <Bar dataKey="current" fill="var(--color-current)" radius={2} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function RegionalComparisonChart({
  previous,
  current,
}: RegionalComparisonChartProps) {
  const leanData = buildLeanData(previous, current);
  const fatData = buildFatData(previous, current);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 mt-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-black">Regional Comparison</h2>
      </div>
      <div className="flex items-center gap-4 mb-5 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-black" />
          Scan 1
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" />
          Scan 2
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RegionChart data={leanData} title="Lean Mass (lb)" />
        <RegionChart data={fatData} title="Fat Mass (lb)" />
      </div>

      <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-4 mt-5">
        Lean values include bone mineral content (Lean + BMC), as reported by Hologic DEXA.
      </p>
    </div>
  );
}
