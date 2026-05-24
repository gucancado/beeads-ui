import { KpiCard, KpiGrid } from "@beeads/charts";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Charts/KpiCard" };
export default meta;
type Story = StoryObj;

export const Grid: Story = {
  render: () => (
    <KpiGrid>
      <KpiCard label="Revenue" value={48500} delta={0.12} hint="vs último mês" />
      <KpiCard label="CPA" value={32.5} delta={-0.08} inverseDelta hint="custo por aquisição" />
      <KpiCard label="ROAS" value="3.4x" delta={0.05} />
      <KpiCard label="Conversions" value={1240} delta={null} />
    </KpiGrid>
  ),
};
