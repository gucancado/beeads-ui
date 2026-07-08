import { Badge } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Badge> = {
  title: "Layout/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "accent", "destructive", "outline", "ok", "warn"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>padrão</Badge>
      <Badge variant="secondary">secundário</Badge>
      <Badge variant="accent">destaque</Badge>
      <Badge variant="destructive">destrutivo</Badge>
      <Badge variant="outline">contorno</Badge>
      <Badge variant="ok">ok</Badge>
      <Badge variant="warn">atenção</Badge>
    </div>
  ),
};
