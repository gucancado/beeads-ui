"use client";

import { Card, CardContent } from "@beeads/ui";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { type ChartFormatter, formatters } from "../lib/chart-theme";

export interface KpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
  delta?: number | null;
  inverseDelta?: boolean;
  formatter?: ChartFormatter;
}

export function KpiCard({
  label,
  value,
  hint,
  delta,
  inverseDelta = false,
  formatter = formatters.number,
}: KpiCardProps) {
  const numericValue = typeof value === "number" ? formatter(value) : value;

  const positive = delta != null && delta > 0;
  const negative = delta != null && delta < 0;
  const isGood = inverseDelta ? negative : positive;
  const isBad = inverseDelta ? positive : negative;

  const deltaColor = isGood ? "text-ok" : isBad ? "text-err" : "text-muted-fg";
  const Icon = positive ? ArrowUp : negative ? ArrowDown : Minus;

  return (
    <Card data-slot="kpi-card">
      <CardContent className="space-y-1 p-4">
        <p className="text-xs text-muted-fg">{label}</p>
        <p className="font-display text-2xl font-semibold tracking-tight">{numericValue}</p>
        <div className="flex items-center gap-2 text-xs">
          {delta != null && (
            <span className={`inline-flex items-center gap-1 ${deltaColor}`}>
              <Icon className="h-3 w-3" />
              {formatters.percent(Math.abs(delta))}
            </span>
          )}
          {hint && <span className="text-muted-fg">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
