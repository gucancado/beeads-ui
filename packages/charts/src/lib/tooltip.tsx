"use client";

import type { ReactElement } from "react";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { type ChartFormatter, formatters } from "./chart-theme";

type InjectedFormatters = {
  __formatter?: ChartFormatter;
  /** Formatter por dataKey (usado quando eixos têm formatters distintos). */
  __formatterByKey?: Record<string, ChartFormatter>;
};

export function ChartTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload, label } = props;
  // formatter(s) podem vir injetados via factory abaixo
  const injected = props as unknown as InjectedFormatters;
  const formatter = injected.__formatter ?? formatters.number;
  const formatterByKey = injected.__formatterByKey;

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label != null && <p className="mb-1 font-medium text-fg">{String(label)}</p>}
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const fmt = formatterByKey?.[String(entry.dataKey)] ?? formatter;
          return (
            <div key={`${entry.dataKey ?? entry.name}-${i}`} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="text-muted-fg">{entry.name}:</span>
              <span className="font-medium text-fg">{fmt(Number(entry.value))}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Cria um render-prop compatível com `<Tooltip content={...}>` do recharts,
 * já injetando o formatter customizado sem violar tipos.
 *
 * `formatterByKey` (opcional) permite formatters distintos por série/dataKey —
 * usado por charts multi-eixo (`MultiLineChart`) onde eixo esquerdo e direito
 * têm formatação diferente. Séries sem entrada no mapa caem no `formatter` base.
 */
export function tooltipRenderer(
  formatter?: ChartFormatter,
  formatterByKey?: Record<string, ChartFormatter>,
) {
  return (props: TooltipProps<ValueType, NameType>): ReactElement => (
    <ChartTooltip
      {...(props as TooltipProps<ValueType, NameType> & InjectedFormatters)}
      // anexa formatter(s) via prop interna para não colidir com `formatter` do recharts
      {...({ __formatter: formatter, __formatterByKey: formatterByKey } as InjectedFormatters)}
    />
  );
}
