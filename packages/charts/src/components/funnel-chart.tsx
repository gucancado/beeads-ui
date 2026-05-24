"use client";

import { type ChartFormatter, formatters } from "../lib/chart-theme";

export interface FunnelStage {
  label: string;
  value: number;
}

export interface FunnelChartProps {
  stages: FunnelStage[];
  formatter?: ChartFormatter;
}

export function FunnelChart({ stages, formatter = formatters.number }: FunnelChartProps) {
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const prev = i > 0 ? stages[i - 1]!.value : null;
        const drop = prev ? 1 - stage.value / prev : null;
        const width = (stage.value / max) * 100;
        const dropColor =
          drop == null
            ? "text-muted-fg"
            : drop <= 0.2
              ? "text-ok"
              : drop <= 0.5
                ? "text-warn"
                : "text-err";
        return (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{stage.label}</span>
              <div className="flex items-center gap-3">
                <span>{formatter(stage.value)}</span>
                {drop != null && (
                  <span className={dropColor}>↓ {formatters.percent(drop)}</span>
                )}
              </div>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-md bg-muted">
              <div
                className="h-full rounded-md bg-accent transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
