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

export const Default: Story = { args: { children: "salvar" } };
export const Accent: Story = { args: { variant: "accent", children: "confirmar" } };
export const Destructive: Story = { args: { variant: "destructive", children: "apagar" } };
export const Outline: Story = { args: { variant: "outline", children: "cancelar" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>padrão</Button>
      <Button variant="accent">destaque</Button>
      <Button variant="destructive">destrutivo</Button>
      <Button variant="outline">contorno</Button>
      <Button variant="secondary">secundário</Button>
      <Button variant="ghost">fantasma</Button>
      <Button variant="link">link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">extra pequeno</Button>
      <Button size="sm">pequeno</Button>
      <Button size="default">padrão</Button>
      <Button size="lg">grande</Button>
    </div>
  ),
};
