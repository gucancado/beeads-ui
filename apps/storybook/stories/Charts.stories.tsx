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
  { date: "jan", spend: 12000, leads: 320 },
  { date: "fev", spend: 18500, leads: 410 },
  { date: "mar", spend: 21000, leads: 480 },
  { date: "abr", spend: 17800, leads: 390 },
  { date: "mai", spend: 22300, leads: 540 },
  { date: "jun", spend: 25100, leads: 620 },
];

const donutData = [
  { name: "Facebook", value: 4200 },
  { name: "Instagram", value: 3100 },
  { name: "Google", value: 2400 },
  { name: "TikTok", value: 1800 },
];

const serieTemporal = [
  { dia: "2026-07-01", sessoes: 320 },
  { dia: "2026-07-02", sessoes: 410 },
  { dia: "2026-07-03", sessoes: 380 },
  { dia: "2026-07-04", sessoes: 455 },
  { dia: "2026-07-05", sessoes: 500 },
  { dia: "2026-07-06", sessoes: 470 },
  { dia: "2026-07-07", sessoes: 530 },
];

export const Line: Story = {
  render: () => (
    <ChartFrame title="investimento ao longo do tempo" description="últimos 6 meses">
      <LineChart
        data={timeSeries}
        xKey="date"
        series={[
          { key: "spend", label: "investimento" },
          { key: "leads", label: "leads" },
        ]}
      />
    </ChartFrame>
  ),
};

export const Area: Story = {
  render: () => (
    <ChartFrame title="área">
      <AreaChart data={timeSeries} xKey="date" series={[{ key: "spend", label: "investimento" }]} />
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
    <ChartFrame title="investimento" description="eixo compacto, tooltip exato">
      <AreaChart
        data={timeSeries}
        xKey="date"
        series={[{ key: "spend", label: "investimento" }]}
        yFormatter={(v) => `R$ ${formatters.compactShort(v)}`}
        tooltipFormatter={formatters.currency}
      />
    </ChartFrame>
  ),
};

export const Bar: Story = {
  render: () => (
    <ChartFrame title="leads por mês">
      <BarChart data={timeSeries} xKey="date" series={[{ key: "leads", label: "leads" }]} />
    </ChartFrame>
  ),
};

export const Donut: Story = {
  render: () => (
    <ChartFrame title="distribuição por plataforma">
      <DonutChart data={donutData} />
    </ChartFrame>
  ),
};

export const Funnel: Story = {
  render: () => (
    <ChartFrame title="funil de conversão">
      <FunnelChart
        stages={[
          { label: "impressões", value: 1_000_000 },
          { label: "cliques", value: 25_000 },
          { label: "leads", value: 1_500 },
          { label: "conversões", value: 280 },
        ]}
      />
    </ChartFrame>
  ),
};

/**
 * `xFormatter` numa série temporal real: os dados vêm com datas ISO (`dia`) e o
 * eixo X + o label do tooltip usam `formatters.dateShort` ("dd/MM") em vez de
 * mostrar a string ISO crua.
 */
export const SerieTemporal: Story = {
  render: () => (
    <ChartFrame title="sessões por dia" description="datas ISO formatadas com xFormatter">
      <LineChart
        data={serieTemporal}
        xKey="dia"
        series={[{ key: "sessoes", label: "sessões" }]}
        xFormatter={formatters.dateShort}
      />
    </ChartFrame>
  ),
};
