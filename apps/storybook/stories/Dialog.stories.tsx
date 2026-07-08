import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Overlays/Dialog" };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={(props) => <Button {...props}>abrir diálogo</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>confirmar ação</DialogTitle>
          <DialogDescription>tem certeza que deseja prosseguir?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">cancelar</Button>
          <Button>confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
