"use client";

import { type ChartFormatter, formatters } from "../lib/chart-theme";

export interface HeatmapCell {
  row: string;
  col: string;
  value: number | null;
  insufficient?: boolean;
}

export interface HeatmapTableProps {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  median?: number;
  direction?: "lower-better" | "higher-better";
  formatter?: ChartFormatter;
}

export function HeatmapTable({
  rows,
  cols,
  cells,
  median,
  direction = "lower-better",
  formatter = formatters.number,
}: HeatmapTableProps) {
  const validValues = cells
    .filter((c) => c.value != null && !c.insufficient)
    .map((c) => c.value as number);
  const sorted = [...validValues].sort((a, b) => a - b);
  const med = median ?? sorted[Math.floor(sorted.length / 2)] ?? 0;

  function cellColor(value: number | null, insufficient?: boolean) {
    if (value == null || insufficient) return "bg-muted text-muted-fg";
    const ratio = value / (med || 1);
    const isGood = direction === "lower-better" ? ratio < 0.75 : ratio > 1.25;
    const isBad = direction === "lower-better" ? ratio > 1.5 : ratio < 0.5;
    if (isGood) return "bg-ok/20 text-fg";
    if (isBad) return "bg-err/20 text-fg";
    return "bg-card text-fg";
  }

  function getCell(row: string, col: string) {
    return cells.find((c) => c.row === row && c.col === col);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-border p-2 text-xs font-medium text-muted-fg" />
            {cols.map((c) => (
              <th key={c} className="border border-border p-2 text-xs font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th className="border border-border p-2 text-left text-xs font-medium">{r}</th>
              {cols.map((c) => {
                const cell = getCell(r, c);
                return (
                  <td
                    key={c}
                    className={`border border-border p-2 text-center text-sm ${cellColor(cell?.value ?? null, cell?.insufficient)}`}
                  >
                    {cell?.value != null && !cell.insufficient ? formatter(cell.value) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
