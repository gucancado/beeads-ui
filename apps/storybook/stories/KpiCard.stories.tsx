import { KpiCard, KpiGrid } from "@beeads/charts";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Charts/KpiCard" };
export default meta;
type Story = StoryObj;

export const Grid: Story = {
  render: () => (
    <KpiGrid>
      <KpiCard label="receita" value={48500} delta={0.12} hint="vs último mês" />
      <KpiCard label="CPA" value={32.5} delta={-0.08} inverseDelta hint="custo por aquisição" />
      <KpiCard label="ROAS" value="3.4x" delta={0.05} />
      <KpiCard label="conversões" value={1240} delta={null} />
    </KpiGrid>
  ),
};

/**
 * `deltaTone="neutral"`: mesma seta + percentual, porém em cinza (`text-muted-fg`)
 * — pra métricas de contexto (investimento, alcance) onde subir/descer não é bom
 * nem ruim. Compare com o "state" (verde/vermelho) da linha de cima.
 */
export const NeutralTone: Story = {
  render: () => (
    <KpiGrid>
      <KpiCard label="investimento (state)" value={48500} delta={0.12} hint="vs último mês" />
      <KpiCard
        label="investimento (neutral)"
        value={48500}
        delta={0.12}
        deltaTone="neutral"
        hint="vs último mês"
      />
      <KpiCard
        label="alcance (neutral)"
        value={1650000}
        delta={-0.09}
        deltaTone="neutral"
        hint="soma diária (aprox.)"
      />
    </KpiGrid>
  ),
};
