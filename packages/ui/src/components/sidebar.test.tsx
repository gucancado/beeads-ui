import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar, SidebarProvider, useSidebar } from "./sidebar";

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
