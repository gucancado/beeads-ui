import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarProvider,
  SidebarSectionLabel,
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

function Shell({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="h-[560px]">
      <SidebarProvider collapsed={collapsed} onCollapsedChange={() => {}} persist="none">
        <Sidebar>
          <SidebarHeader logo={<NotebookPen />} title={<>blo·quim</>} />
          <SidebarBody>
            <div className="space-y-6">
              <div className="space-y-1">
                <SidebarNavItem icon={<CheckSquare />} label="Tarefas" active />
                <SidebarNavItem icon={<Folders />} label="Espaços de Trabalho" />
              </div>
              <div className="space-y-1">
                <SidebarSectionLabel>Espaços</SidebarSectionLabel>
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
