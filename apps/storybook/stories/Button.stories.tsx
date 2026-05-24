import { Button } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
  title: "Forms/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "accent", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: { control: "select", options: ["xs", "sm", "default", "lg", "icon"] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: "Salvar" } };
export const Accent: Story = { args: { variant: "accent", children: "Confirmar" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Apagar" } };
export const Outline: Story = { args: { variant: "outline", children: "Cancelar" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Default</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
