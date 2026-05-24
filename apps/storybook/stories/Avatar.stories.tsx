import { Avatar, AvatarFallback, AvatarImage } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Layout/Avatar" };
export default meta;
type Story = StoryObj;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};
export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>GA</AvatarFallback>
    </Avatar>
  ),
};
