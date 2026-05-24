"use client";

import type { ReactElement } from "react";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { type ChartFormatter, formatters } from "./chart-theme";

export function ChartTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload, label } = props;
  // formatter pode vir injetado via factory abaixo
  const formatter =
    ((props as unknown as { __formatter?: ChartFormatter }).__formatter as ChartFormatter | undefined) ??
    formatters.number;

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label != null && <p className="mb-1 font-medium text-fg">{String(label)}</p>}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-muted-fg">{entry.name}:</span>
            <span className="font-medium text-fg">{formatter(Number(entry.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Cria um render-prop compatível com `<Tooltip content={...}>` do recharts,
 * já injetando o formatter customizado sem violar tipos.
 */
export function tooltipRenderer(formatter?: ChartFormatter) {
  return (props: TooltipProps<ValueType, NameType>): ReactElement => (
    <ChartTooltip
      {...(props as TooltipProps<ValueType, NameType> & { __formatter?: ChartFormatter })}
      // anexa formatter via prop interna para não colidir com `formatter` do recharts
      {...({ __formatter: formatter } as { __formatter?: ChartFormatter })}
    />
  );
}
