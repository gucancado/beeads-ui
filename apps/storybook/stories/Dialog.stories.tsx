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
      <DialogTrigger
        render={
          (props) => (
            <Button {...props}>Abrir Dialog</Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar ação</DialogTitle>
          <DialogDescription>Tem certeza que deseja prosseguir?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
