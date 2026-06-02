import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarProvider,
  SidebarSectionLabel,
  useSidebar,
} from "./sidebar";

// ---------- Harness ----------

function Harness() {
  const { collapsed, toggle } = useSidebar();
  return (
    <button type="button" onClick={toggle}>
      {collapsed ? "collapsed" : "expanded"}
    </button>
  );
}

// ---------- useSidebar ----------

describe("useSidebar", () => {
  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useSidebar())).toThrow(/must be used within a SidebarProvider/);
  });
});

// ---------- Sidebar ----------

describe("Sidebar", () => {
  it("renders expanded width when not collapsed", () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="aside">conteudo</Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("w-72");
    expect(aside).toHaveAttribute("data-state", "expanded");
  });

  it("renders collapsed width when controlled-collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <Sidebar data-testid="aside">conteudo</Sidebar>
      </SidebarProvider>,
    );
    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("w-16");
    expect(aside).toHaveAttribute("data-state", "collapsed");
  });
});

// ---------- SidebarProvider behavior ----------

const TEST_KEY = "test_sidebar_key";

describe("SidebarProvider behavior", () => {
  beforeEach(() => {
    localStorage.removeItem(TEST_KEY);
    // Clear cookies that might have been set in previous tests
    document.cookie = `${TEST_KEY}=; max-age=0; path=/`;
  });

  afterEach(() => {
    localStorage.removeItem(TEST_KEY);
    document.cookie = `${TEST_KEY}=; max-age=0; path=/`;
  });

  it("uncontrolled toggle flips state", async () => {
    render(
      <SidebarProvider persist="none">
        <Harness />
      </SidebarProvider>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("expanded");

    await userEvent.click(btn);
    expect(btn).toHaveTextContent("collapsed");
  });

  it("controlled mode calls onCollapsedChange without changing internal state", async () => {
    const spy = vi.fn();
    render(
      <SidebarProvider collapsed={false} onCollapsedChange={spy}>
        <Harness />
      </SidebarProvider>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("expanded");

    await userEvent.click(btn);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(true);
    // Parent never updated the prop, so internal stays "expanded"
    expect(btn).toHaveTextContent("expanded");
  });

  it("persists to localStorage and rehydrates on mount", async () => {
    const { unmount } = render(
      <SidebarProvider persist="localStorage" storageKey={TEST_KEY}>
        <Harness />
      </SidebarProvider>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("expanded");

    // Toggle to collapsed — this should write to localStorage
    await userEvent.click(btn);
    expect(btn).toHaveTextContent("collapsed");
    expect(localStorage.getItem(TEST_KEY)).toBe("true");

    unmount();

    // Fresh provider with same key should rehydrate to collapsed
    render(
      <SidebarProvider persist="localStorage" storageKey={TEST_KEY}>
        <Harness />
      </SidebarProvider>,
    );

    // After mount effect rehydrates, should show collapsed
    expect(await screen.findByText("collapsed")).toBeTruthy();
  });

  it("persist='none' writes nothing to localStorage", async () => {
    render(
      <SidebarProvider persist="none" storageKey={TEST_KEY}>
        <Harness />
      </SidebarProvider>,
    );

    await userEvent.click(screen.getByRole("button"));

    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });
});

// ---------- SidebarBody ----------

describe("SidebarBody", () => {
  it("renders its children", () => {
    render(
      <SidebarProvider>
        <SidebarBody>
          <span>miolo</span>
        </SidebarBody>
      </SidebarProvider>,
    );
    expect(screen.getByText("miolo")).toBeInTheDocument();
  });

  it("wraps children in a navigation landmark with a default label", () => {
    render(
      <SidebarProvider>
        <SidebarBody>
          <span>miolo</span>
        </SidebarBody>
      </SidebarProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Navegação principal" })).toBeInTheDocument();
  });

  it("uses a custom aria-label for the navigation landmark", () => {
    render(
      <SidebarProvider>
        <SidebarBody aria-label="Menu">
          <span>miolo</span>
        </SidebarBody>
      </SidebarProvider>,
    );
    expect(screen.getByRole("navigation", { name: "Menu" })).toBeInTheDocument();
  });
});

// ---------- SidebarSectionLabel ----------

describe("SidebarSectionLabel", () => {
  it("renders the label when expanded", () => {
    render(
      <SidebarProvider>
        <SidebarSectionLabel>Agentes</SidebarSectionLabel>
      </SidebarProvider>,
    );
    expect(screen.getByText("Agentes")).toBeInTheDocument();
  });

  it("renders nothing when collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarSectionLabel>Agentes</SidebarSectionLabel>
      </SidebarProvider>,
    );
    expect(screen.queryByText("Agentes")).not.toBeInTheDocument();
  });
});

// ---------- SidebarHeader ----------

describe("SidebarHeader", () => {
  it("shows the title when expanded", () => {
    render(
      <SidebarProvider>
        <SidebarHeader logo={<svg data-testid="logo" />} title="bloquim" />
      </SidebarProvider>,
    );
    expect(screen.getByText("bloquim")).toBeInTheDocument();
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("hides the title but keeps the logo when collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarHeader logo={<svg data-testid="logo" />} title="bloquim" />
      </SidebarProvider>,
    );
    expect(screen.queryByText("bloquim")).not.toBeInTheDocument();
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("does not render the toggle button when collapsible is false", () => {
    render(
      <SidebarProvider collapsible={false}>
        <SidebarHeader logo={<svg />} title="bloquim" />
      </SidebarProvider>,
    );
    expect(screen.queryByRole("button", { name: "recolher menu" })).toBeNull();
  });

  it("toggles collapsed state when the toggle button is clicked", async () => {
    const onChange = vi.fn();
    render(
      <SidebarProvider collapsed={false} onCollapsedChange={onChange}>
        <SidebarHeader logo={<svg />} title="bloquim" />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "recolher menu" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

// ---------- SidebarNavItem ----------

describe("SidebarNavItem", () => {
  it("applies the active styling", () => {
    render(
      <SidebarProvider>
        <SidebarNavItem label="Tarefas" active />
      </SidebarProvider>,
    );
    expect(screen.getByRole("button", { name: "Tarefas" })).toHaveClass("bg-sidebar-accent");
  });

  it("renders as a link via the render prop", () => {
    render(
      <SidebarProvider>
        <SidebarNavItem label="Tarefas" render={(props) => <a href="/my-tasks" {...props} />} />
      </SidebarProvider>,
    );
    expect(screen.getByRole("link", { name: "Tarefas" })).toHaveAttribute("href", "/my-tasks");
  });

  it("hides the label when collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarNavItem label="Tarefas" icon={<svg />} title="Tarefas" />
      </SidebarProvider>,
    );
    // The trigger button has no visible label text when collapsed.
    expect(screen.getByRole("button")).not.toHaveTextContent("Tarefas");
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <SidebarNavItem label="Tarefas" onClick={onClick} />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Tarefas" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders the badge when expanded", () => {
    render(
      <SidebarProvider>
        <SidebarNavItem label="Alertas" badge={<span>3</span>} />
      </SidebarProvider>,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("still renders the badge (as a bubble) when collapsed", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarNavItem label="Alertas" icon={<svg />} title="Alertas" badge={<span>3</span>} />
      </SidebarProvider>,
    );
    // label hidden, but badge content stays visible as a bubble over the icon
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toHaveTextContent("Alertas");
  });

  it("gives the collapsed button an accessible name from title", () => {
    render(
      <SidebarProvider collapsed onCollapsedChange={vi.fn()}>
        <SidebarNavItem label="Alertas" icon={<svg />} title="Alertas (3)" badge={<span>3</span>} />
      </SidebarProvider>,
    );
    expect(screen.getByRole("button", { name: "Alertas (3)" })).toBeInTheDocument();
  });
});

// ---------- SidebarFooter ----------

describe("SidebarFooter", () => {
  const user = { name: "Gustavo", email: "g@beeads.com.br", avatarUrl: null };

  it("renders the user name and email when expanded", () => {
    render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={vi.fn()} />
      </SidebarProvider>,
    );
    expect(screen.getByText("Gustavo")).toBeInTheDocument();
    expect(screen.getByText("g@beeads.com.br")).toBeInTheDocument();
  });

  it("fires onLogout when the logout button is clicked", async () => {
    const onLogout = vi.fn();
    render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={onLogout} />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "sair" }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("renders the settings button only when there are items", () => {
    const { rerender } = render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={vi.fn()} />
      </SidebarProvider>,
    );
    expect(screen.queryByRole("button", { name: "configurações" })).not.toBeInTheDocument();

    rerender(
      <SidebarProvider>
        <SidebarFooter
          user={user}
          onLogout={vi.fn()}
          settingsItems={[{ label: "perfil", onSelect: vi.fn() }]}
        />
      </SidebarProvider>,
    );
    expect(screen.getByRole("button", { name: "configurações" })).toBeInTheDocument();
  });

  it("fires onProfileClick when the profile button is clicked", async () => {
    const onProfileClick = vi.fn();
    render(
      <SidebarProvider>
        <SidebarFooter user={user} onLogout={vi.fn()} onProfileClick={onProfileClick} />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /editar perfil/i }));
    expect(onProfileClick).toHaveBeenCalledOnce();
  });

  it("honors a custom logout label from the labels prop", () => {
    render(
      <SidebarProvider labels={{ logout: "Sign out" }}>
        <SidebarFooter user={user} onLogout={vi.fn()} />
      </SidebarProvider>,
    );
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });
});
