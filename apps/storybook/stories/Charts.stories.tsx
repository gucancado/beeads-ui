import {
  AreaChart,
  BarChart,
  ChartFrame,
  DonutChart,
  FunnelChart,
  LineChart,
  formatters,
} from "@beeads/charts";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Charts/Showcase" };
export default meta;
type Story = StoryObj;

const timeSeries = [
  { date: "Jan", spend: 12000, leads: 320 },
  { date: "Fev", spend: 18500, leads: 410 },
  { date: "Mar", spend: 21000, leads: 480 },
  { date: "Abr", spend: 17800, leads: 390 },
  { date: "Mai", spend: 22300, leads: 540 },
  { date: "Jun", spend: 25100, leads: 620 },
];

const donutData = [
  { name: "Facebook", value: 4200 },
  { name: "Instagram", value: 3100 },
  { name: "Google", value: 2400 },
  { name: "TikTok", value: 1800 },
];

export const Line: Story = {
  render: () => (
    <ChartFrame title="Spend over time" description="Últimos 6 meses">
      <LineChart
        data={timeSeries}
        xKey="date"
        series={[
          { key: "spend", label: "Spend" },
          { key: "leads", label: "Leads" },
        ]}
      />
    </ChartFrame>
  ),
};

export const Area: Story = {
  render: () => (
    <ChartFrame title="Area">
      <AreaChart data={timeSeries} xKey="date" series={[{ key: "spend", label: "Spend" }]} />
    </ChartFrame>
  ),
};

/**
 * `tooltipFormatter` separado do eixo: o eixo Y usa `compactShort` ("R$ 1,3k")
 * pra caber no tick, mas o tooltip mostra o valor exato ("R$ 25.100,00") ao passar
 * o mouse — única fonte de precisão do hover. Sem a prop, os dois compartilhavam
 * um formatter só.
 */
export const AxisVsTooltip: Story = {
  render: () => (
    <ChartFrame title="Investimento" description="Eixo compacto, tooltip exato">
      <AreaChart
        data={timeSeries}
        xKey="date"
        series={[{ key: "spend", label: "Investimento" }]}
        yFormatter={(v) => `R$ ${formatters.compactShort(v)}`}
        tooltipFormatter={formatters.currency}
      />
    </ChartFrame>
  ),
};

export const Bar: Story = {
  render: () => (
    <ChartFrame title="Leads por mês">
      <BarChart data={timeSeries} xKey="date" series={[{ key: "leads", label: "Leads" }]} />
    </ChartFrame>
  ),
};

export const Donut: Story = {
  render: () => (
    <ChartFrame title="Distribuição por plataforma">
      <DonutChart data={donutData} />
    </ChartFrame>
  ),
};

export const Funnel: Story = {
  render: () => (
    <ChartFrame title="Funil de conversão">
      <FunnelChart
        stages={[
          { label: "Impressões", value: 1_000_000 },
          { label: "Clicks", value: 25_000 },
          { label: "Leads", value: 1_500 },
          { label: "Conversões", value: 280 },
        ]}
      />
    </ChartFrame>
  ),
};
