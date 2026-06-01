"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { type ChartFormatter, chartColor, formatters } from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";

export interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  formatter?: ChartFormatter;
}

export function DonutChart({ data, height = 280, formatter = formatters.number }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={tooltipRenderer(formatter)} />
        <Legend />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={chartColor(i)} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
