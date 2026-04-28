"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/_components/button";
import { saveGoal } from "../actions";

type Metric = "tbf_pct" | "almi" | "vat_area_cm2" | "weight_lb";
type Direction = "decrease" | "increase" | "maintain";

interface MetricConfig {
  key: Metric;
  label: string;
  description: string;
  defaultDirection: Direction;
}

const METRICS: MetricConfig[] = [
  {
    key: "tbf_pct",
    label: "Body Fat %",
    description: "Total body fat percentage",
    defaultDirection: "decrease",
  },
  {
    key: "almi",
    label: "Lean Mass Index",
    description: "Appendicular lean mass index (ALMI)",
    defaultDirection: "increase",
  },
  {
    key: "vat_area_cm2",
    label: "Visceral Fat Area",
    description: "Visceral adipose tissue area",
    defaultDirection: "decrease",
  },
  {
    key: "weight_lb",
    label: "Weight",
    description: "Total body weight",
    defaultDirection: "decrease",
  },
];

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "decrease", label: "Decrease" },
  { value: "increase", label: "Increase" },
  { value: "maintain", label: "Maintain" },
];

export function GoalForm() {
  const [selected, setSelected] = useState<Map<Metric, Direction>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleMetric(key: Metric, defaultDirection: Direction) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, defaultDirection);
      }
      return next;
    });
  }

  function setDirection(key: Metric, direction: Direction) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(key, direction);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.size === 0) {
      setError("Select at least one metric.");
      return;
    }

    const metrics = Array.from(selected.entries()).map(([metric, direction]) => ({
      metric,
      direction,
    }));

    const formData = new FormData();
    formData.set("metrics", JSON.stringify(metrics));

    setError(null);
    startTransition(async () => {
      const result = await saveGoal(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {METRICS.map(({ key, label, description, defaultDirection }) => {
          const isSelected = selected.has(key);
          const direction = selected.get(key);

          return (
            <div
              key={key}
              onClick={() => toggleMetric(key, defaultDirection)}
              className={`bg-white border border-neutral-200 rounded-lg p-5 cursor-pointer transition-all select-none ${
                isSelected
                  ? "ring-2 ring-[#3083ff]"
                  : "hover:border-neutral-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-900 text-sm">
                    {label}
                  </p>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "bg-[#3083ff] border-[#3083ff]"
                      : "border-neutral-300"
                  }`}
                />
              </div>

              {isSelected && direction !== undefined && (
                <div
                  className="flex gap-1 mt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {DIRECTIONS.map(({ value, label: dirLabel }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDirection(key, value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        direction === value
                          ? "bg-kalos-blue text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {dirLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={selected.size === 0 || isPending}
        className="px-8 py-3 self-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving…" : "Set goals"}
      </Button>
    </form>
  );
}
