import { Alert, AlertDescription, AlertTitle } from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const meta: Meta = { title: "Feedback/Alert" };
export default meta;
type Story = StoryObj;

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert>
        <Info />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>Mensagem informativa neutra.</AlertDescription>
      </Alert>
      <Alert variant="ok">
        <CheckCircle2 />
        <AlertTitle>Sucesso</AlertTitle>
        <AlertDescription>Operação concluída.</AlertDescription>
      </Alert>
      <Alert variant="warn">
        <AlertCircle />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>Algo precisa de revisão.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Não foi possível completar a ação.</AlertDescription>
      </Alert>
    </div>
  ),
};
