import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Layout/Tabs" };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">conta</TabsTrigger>
        <TabsTrigger value="password">senha</TabsTrigger>
      </TabsList>
      <TabsContent value="account">conteúdo da aba conta.</TabsContent>
      <TabsContent value="password">conteúdo da aba senha.</TabsContent>
    </Tabs>
  ),
};
