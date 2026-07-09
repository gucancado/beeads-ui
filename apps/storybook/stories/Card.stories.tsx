import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Layout/Card",
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>workspace nova</CardTitle>
        <CardDescription>crie uma workspace para começar.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">detalhes da workspace…</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">cancelar</Button>
        <Button>criar</Button>
      </CardFooter>
    </Card>
  ),
};
