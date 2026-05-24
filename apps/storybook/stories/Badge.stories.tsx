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
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ok">OK</Badge>
      <Badge variant="warn">Warn</Badge>
    </div>
  ),
};
