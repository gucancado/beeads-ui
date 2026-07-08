import { render, screen } from "@testing-library/react";
import { type ReactElement, type ReactNode, cloneElement } from "react";
import { describe, expect, it, vi } from "vitest";

// recharts' ResponsiveContainer renders nothing in happy-dom because the
// container has no measurable width/height (ResizeObserver reports 0x0). Replace
// it with a version that injects fixed width/height directly onto the chart
// element — the same mechanism the real container uses — so the SVG surface
// actually mounts and we can assert on real markup.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) =>
      cloneElement(children as ReactElement, { width: 400, height: 300 }),
  };
});

import { formatters } from "../lib/chart-theme";
import { tooltipRenderer } from "../lib/tooltip";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import { ChartFrame } from "./chart-frame";
import { DonutChart } from "./donut-chart";
import { FilterBar } from "./filter-bar";
import { FunnelChart } from "./funnel-chart";
import { HeatmapTable } from "./heatmap-table";
import { KpiCard } from "./kpi-card";
import { KpiGrid } from "./kpi-grid";
import { LineChart } from "./line-chart";
import { MultiLineChart } from "./multi-line-chart";
import { PeriodPicker } from "./period-picker";

const timeSeries = [
  { month: "Jan", impressions: 100, clicks: 10 },
  { month: "Feb", impressions: 200, clicks: 25 },
  { month: "Mar", impressions: 150, clicks: 18 },
];

const series = [
  { key: "impressions" as const, label: "Impressões" },
  { key: "clicks" as const, label: "Cliques" },
];

describe("ChartFrame", () => {
  it("renders title, description and children", () => {
    render(
      <ChartFrame title="Receita" description="Por mês">
        <div>conteúdo</div>
      </ChartFrame>,
    );
    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByText("Por mês")).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("renders actions and footer slots", () => {
    render(
      <ChartFrame title="T" actions={<button type="button">Exportar</button>} footer="rodapé">
        <div>x</div>
      </ChartFrame>,
    );
    expect(screen.getByRole("button", { name: "Exportar" })).toBeInTheDocument();
    expect(screen.getByText("rodapé")).toBeInTheDocument();
  });
});

describe("LineChart", () => {
  it("renders an svg surface without throwing", () => {
    const { container } = render(<LineChart data={timeSeries} xKey="month" series={series} />);
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
  });

  it("aplica xFormatter nos ticks do eixo X", () => {
    const dateSeries = [
      { dia: "2026-07-01", valor: 10 },
      { dia: "2026-07-02", valor: 20 },
    ];
    const { container } = render(
      <LineChart
        data={dateSeries}
        xKey="dia"
        series={[{ key: "valor", label: "valor" }]}
        xFormatter={(v) => formatters.dateShort(v)}
      />,
    );
    // recharts renderiza ticks como <text>; com xFormatter os labels ISO viram dd/MM
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
    expect(screen.queryByText("2026-07-01")).not.toBeInTheDocument();
    expect(screen.getByText("01/07")).toBeInTheDocument();
  });
});

describe("AreaChart", () => {
  it("renders an svg surface without throwing", () => {
    const { container } = render(<AreaChart data={timeSeries} xKey="month" series={series} />);
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
  });
});

describe("BarChart", () => {
  it("renders an svg surface without throwing", () => {
    const { container } = render(<BarChart data={timeSeries} xKey="month" series={series} />);
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
  });

  it("renders when stacked", () => {
    const { container } = render(
      <BarChart data={timeSeries} xKey="month" series={series} stacked />,
    );
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
  });
});

describe("MultiLineChart", () => {
  it("renders an svg surface and dual axes without throwing", () => {
    const { container } = render(
      <MultiLineChart
        data={timeSeries}
        xKey="month"
        series={[
          { key: "impressions", label: "Impressões", axis: "left" },
          { key: "clicks", label: "Cliques", axis: "right", dash: "dashed" },
        ]}
      />,
    );
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
  });
});

describe("DonutChart", () => {
  it("renders an svg surface without throwing", () => {
    const { container } = render(
      <DonutChart
        data={[
          { name: "A", value: 30 },
          { name: "B", value: 70 },
        ]}
      />,
    );
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
  });
});

describe("FunnelChart", () => {
  it("renders each stage label and formatted value", () => {
    render(
      <FunnelChart
        stages={[
          { label: "Visitas", value: 1000 },
          { label: "Leads", value: 250 },
          { label: "Vendas", value: 50 },
        ]}
      />,
    );
    expect(screen.getByText("Visitas")).toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();
    expect(screen.getByText("Vendas")).toBeInTheDocument();
    // pt-BR formatted value for the first stage
    expect(screen.getByText("1.000")).toBeInTheDocument();
  });
});

describe("HeatmapTable", () => {
  it("renders a table with column and row headers and cell values", () => {
    render(
      <HeatmapTable
        rows={["Campanha A", "Campanha B"]}
        cols={["Seg", "Ter"]}
        cells={[
          { row: "Campanha A", col: "Seg", value: 10 },
          { row: "Campanha A", col: "Ter", value: 20 },
          { row: "Campanha B", col: "Seg", value: null },
          { row: "Campanha B", col: "Ter", value: 30 },
        ]}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Campanha A")).toBeInTheDocument();
    expect(screen.getByText("Seg")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    // null cells render an em-dash placeholder
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("KpiCard", () => {
  it("renders the label and formatted numeric value", () => {
    render(<KpiCard label="Receita" value={1500} />);
    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByText("1.500")).toBeInTheDocument();
  });

  it("renders the delta percentage and hint when provided", () => {
    render(<KpiCard label="CTR" value="3,2%" delta={0.15} hint="vs. mês anterior" />);
    expect(screen.getByText("3,2%")).toBeInTheDocument();
    expect(screen.getByText("15.0%")).toBeInTheDocument();
    expect(screen.getByText("vs. mês anterior")).toBeInTheDocument();
  });

  it('colors the delta by state when deltaTone is "state" (default)', () => {
    render(<KpiCard label="Receita" value={1000} delta={0.15} />);
    const deltaSpan = screen.getByText("15.0%").closest("span");
    expect(deltaSpan?.className).toContain("text-ok");
    expect(deltaSpan?.className).not.toContain("text-muted-fg");
  });

  it('renders the same arrow + percent but muted when deltaTone is "neutral"', () => {
    render(<KpiCard label="Investimento" value={1000} delta={0.15} deltaTone="neutral" />);
    const deltaSpan = screen.getByText("15.0%").closest("span");
    expect(deltaSpan?.className).toContain("text-muted-fg");
    expect(deltaSpan?.className).not.toContain("text-ok");
    expect(deltaSpan?.className).not.toContain("text-err");
  });

  it('ignores inverseDelta when deltaTone is "neutral"', () => {
    render(<KpiCard label="Alcance" value={1000} delta={-0.1} inverseDelta deltaTone="neutral" />);
    const deltaSpan = screen.getByText("10.0%").closest("span");
    expect(deltaSpan?.className).toContain("text-muted-fg");
    expect(deltaSpan?.className).not.toContain("text-ok");
  });
});

describe("KpiGrid", () => {
  it("renders its children inside the grid container", () => {
    render(
      <KpiGrid>
        <KpiCard label="A" value={1} />
        <KpiCard label="B" value={2} />
      </KpiGrid>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});

describe("FilterBar", () => {
  it("renders a search input with the given placeholder and extra children", () => {
    render(
      <FilterBar searchPlaceholder="Filtrar campanhas…">
        <button type="button">Status</button>
      </FilterBar>,
    );
    expect(screen.getByPlaceholderText("Filtrar campanhas…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Status" })).toBeInTheDocument();
  });
});

describe("tooltip formatter (A2)", () => {
  const tooltipProps = {
    active: true,
    label: "Jan",
    payload: [
      { dataKey: "spend", name: "Investimento", value: 1287.42, color: "#000" },
      { dataKey: "clicks", name: "Cliques", value: 33263, color: "#111" },
    ],
    // biome-ignore lint/suspicious/noExplicitAny: recharts TooltipProps shape is partial here
  } as any;

  it("formats every entry with the single formatter (back-compat)", () => {
    const renderTip = tooltipRenderer(formatters.compactShort);
    render(renderTip(tooltipProps));
    expect(screen.getByText("1,3k")).toBeInTheDocument();
    expect(screen.getByText("33k")).toBeInTheDocument();
  });

  it("applies a distinct exact formatter (tooltip ≠ axis)", () => {
    const renderTip = tooltipRenderer(formatters.currency);
    render(renderTip(tooltipProps));
    // exact currency, not compact — proves the tooltip formatter is independent
    expect(screen.getByText("R$ 1.287,42")).toBeInTheDocument();
  });

  it("dispatches per-dataKey formatters for multi-axis charts", () => {
    const renderTip = tooltipRenderer(formatters.compactShort, {
      spend: formatters.currency,
      clicks: formatters.compactShort,
    });
    render(renderTip(tooltipProps));
    expect(screen.getByText("R$ 1.287,42")).toBeInTheDocument();
    expect(screen.getByText("33k")).toBeInTheDocument();
  });

  it("charts accept a tooltipFormatter prop without throwing", () => {
    const { container } = render(
      <AreaChart
        data={timeSeries}
        xKey="month"
        series={series}
        yFormatter={formatters.compactShort}
        tooltipFormatter={formatters.currency}
      />,
    );
    expect(container.querySelector("svg.recharts-surface")).toBeInTheDocument();
  });
});

describe("formatters.compactShort (A3)", () => {
  const cases: Array<[number, string]> = [
    [1250, "1,3k"],
    [33263, "33k"],
    [1651802, "1,7M"],
    [999600, "1M"], // promoção do tier: não vira "1.000k"
    [999400, "999k"],
    [830, "830"],
    [3618, "3,6k"],
    [0, "0"],
  ];
  for (const [input, expected] of cases) {
    it(`formats ${input} as "${expected}"`, () => {
      expect(formatters.compactShort(input)).toBe(expected);
    });
  }
});

describe("PeriodPicker", () => {
  it("renders a trigger button showing the formatted range", () => {
    render(
      <PeriodPicker
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 0, 31) }}
        onChange={() => {}}
      />,
    );
    // The trigger button shows the pt-BR formatted range (e.g. "1 jan – 31 jan 2026")
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();
    expect(trigger.textContent).toMatch(/jan/i);
    expect(trigger.textContent).toMatch(/2026/);
  });
});
