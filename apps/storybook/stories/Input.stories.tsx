import { Input, Label } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Input> = {
  title: "Forms/Input",
  component: Input,
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "Digite seu nome" } };
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="voce@beeads.com.br" />
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true, placeholder: "Desabilitado" } };
