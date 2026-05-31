import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "./sidebar";

describe("useSidebar", () => {
  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useSidebar())).toThrow(
      /must be used within a SidebarProvider/,
    );
  });
});

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
