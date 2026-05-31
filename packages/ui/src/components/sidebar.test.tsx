import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarBody,
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
});
