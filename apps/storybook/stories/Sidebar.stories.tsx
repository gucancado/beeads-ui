import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarProvider,
  SidebarSectionLabel,
  SidebarTrigger,
} from "@beeads/ui";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CheckSquare,
  FileText,
  Folders,
  LayoutDashboard,
  NotebookPen,
  Plug,
  User,
} from "lucide-react";

const meta: Meta = {
  title: "Layout/Sidebar",
};
export default meta;
type Story = StoryObj;

const user = {
  name: "Gustavo Cançado",
  email: "gustavo.azvd@gmail.com",
  avatarUrl: null,
};

const settingsItems = [
  { label: "perfil", icon: <User />, onSelect: () => {} },
  { label: "modelos", icon: <FileText />, onSelect: () => {} },
  { label: "integrações", icon: <Plug />, onSelect: () => {} },
];

/** Conteúdo (header/body/footer) reaproveitado por todas as demos de Sidebar. */
function SidebarDemoContent() {
  return (
    <>
      <SidebarHeader logo={<NotebookPen />} title={<>blo·quim</>} />
      <SidebarBody>
        <div className="space-y-6">
          <div className="space-y-1">
            <SidebarNavItem icon={<CheckSquare />} label="tarefas" active />
            <SidebarNavItem icon={<Folders />} label="espaços de trabalho" />
          </div>
          <div className="space-y-1">
            <SidebarSectionLabel>espaços</SidebarSectionLabel>
            <SidebarNavItem icon={<LayoutDashboard />} label="Marketing" />
            <SidebarNavItem icon={<LayoutDashboard />} label="Produto" />
          </div>
        </div>
      </SidebarBody>
      <SidebarFooter
        user={user}
        settingsItems={settingsItems}
        onLogout={() => {}}
        onProfileClick={() => {}}
      />
    </>
  );
}

/**
 * A `Sidebar` real é `sticky top-0 h-svh` (fixa, ocupa a viewport inteira). Nas demos
 * de vitrine (Expanded/Collapsed/Dark/NonCollapsible) o preview fica confinado a uma
 * caixa de 560px — por isso o `className="h-full"` no `<Sidebar>` sobrepõe o `h-svh`
 * padrão (via `cn`/tailwind-merge) só aqui, pra caber na caixa sem estourar o canvas.
 * A story `PaginaComScroll`, abaixo, demonstra o comportamento real (sticky + h-svh)
 * numa página que rola de verdade.
 */
function Shell({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="h-[560px] overflow-hidden">
      <SidebarProvider collapsed={collapsed} onCollapsedChange={() => {}} persist="none">
        <Sidebar className="h-full">
          <SidebarDemoContent />
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}

export const Expanded: Story = { render: () => <Shell /> };
export const Collapsed: Story = { render: () => <Shell collapsed /> };

export const Dark: Story = {
  render: () => (
    <div className="dark bg-bg p-0">
      <Shell />
    </div>
  ),
};

export const NonCollapsible: Story = {
  render: () => (
    <div className="h-[560px] overflow-hidden">
      <SidebarProvider collapsible={false} persist="none">
        <Sidebar className="h-full">
          <SidebarHeader logo={<NotebookPen />} title={<>blo·quim</>} />
          <SidebarBody aria-label="menu principal">
            <div className="space-y-1">
              <SidebarNavItem icon={<CheckSquare />} label="tarefas" active />
              <SidebarNavItem icon={<Folders />} label="espaços de trabalho" />
            </div>
          </SidebarBody>
          <SidebarFooter
            user={user}
            settingsItems={settingsItems}
            onLogout={() => {}}
            onProfileClick={() => {}}
          />
        </Sidebar>
      </SidebarProvider>
    </div>
  ),
};

/**
 * Layout de página real, sem caixa confinada: `min-h-svh` no wrapper + a `Sidebar`
 * no seu tamanho padrão (`sticky top-0 h-svh`). Role o conteúdo do `<main>` pra ver
 * a barra permanecer fixa enquanto só o conteúdo rola — é o padrão de plataforma
 * (Padrão 4: sidebar fixa) que os 3 apps consumidores devem reproduzir.
 */
export const PaginaComScroll: Story = {
  render: () => (
    <SidebarProvider persist="none">
      <div className="flex min-h-svh">
        <Sidebar>
          <SidebarDemoContent />
        </Sidebar>
        <main className="flex-1 p-6">
          <h1 className="font-display text-xl">conteúdo longo — a barra fica fixa</h1>
          {Array.from({ length: 60 }, (_, i) => (
            <p key={i} className="py-2 text-sm text-muted-fg">
              linha {i + 1}
            </p>
          ))}
        </main>
      </div>
    </SidebarProvider>
  ),
};

/**
 * Abaixo de 768px (breakpoint default de `useIsMobile`), a `Sidebar` vira um
 * off-canvas (Sheet) aberto/fechado pelo `SidebarTrigger` no topbar do app.
 * Este Storybook (8.4, addon-essentials sem `features.viewportStoryGlobals`)
 * não expõe a API `globals: { viewport }` por story nesta versão — pra ver o
 * comportamento mobile de fato, abra os devtools do navegador na aba Canvas e
 * emule um viewport estreito (ex.: iPhone, <768px).
 */
export const Mobile: Story = {
  render: () => (
    <SidebarProvider persist="none">
      <div className="flex min-h-svh flex-col">
        <header className="flex items-center gap-2 border-b border-border p-2">
          <SidebarTrigger />
          <span className="font-display">app</span>
        </header>
        <Sidebar>
          <SidebarDemoContent />
        </Sidebar>
        <main className="flex-1 p-4">conteúdo</main>
      </div>
    </SidebarProvider>
  ),
};
