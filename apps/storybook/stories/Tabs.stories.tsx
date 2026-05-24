import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Layout/Tabs" };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Conta</TabsTrigger>
        <TabsTrigger value="password">Senha</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Conteúdo da aba Conta.</TabsContent>
      <TabsContent value="password">Conteúdo da aba Senha.</TabsContent>
    </Tabs>
  ),
};
