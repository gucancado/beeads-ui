"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "../lib/utils";
import { ScrollArea } from "./scroll-area";
import { ThemeToggle } from "./theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

// ---------- Context ----------

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

// ---------- Persistence helpers ----------

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readPersisted(persist: "cookie" | "localStorage", key: string): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    if (persist === "localStorage") {
      const v = window.localStorage.getItem(key);
      return v === null ? null : v === "true";
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    return match ? match[1] === "true" : null;
  } catch {
    return null;
  }
}

function writePersisted(persist: "cookie" | "localStorage", key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (persist === "localStorage") {
      window.localStorage.setItem(key, String(value));
    } else {
      document.cookie = `${key}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    }
  } catch {
    /* ignore */
  }
}

// ---------- Provider ----------

export interface SidebarProviderProps {
  children: ReactNode;
  /** Controlled collapsed state. When set, the provider does not manage state itself. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Uncontrolled initial value (default false = expanded). Use for SSR seed. */
  defaultCollapsed?: boolean;
  /** Persistence for uncontrolled mode (default "cookie"). */
  persist?: "cookie" | "localStorage" | "none";
  /** Storage key (default "beeads_sidebar_collapsed"). */
  storageKey?: string;
}

export function SidebarProvider({
  children,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  defaultCollapsed = false,
  persist = "cookie",
  storageKey = "beeads_sidebar_collapsed",
}: SidebarProviderProps) {
  const isControlled = controlledCollapsed !== undefined;
  const [internal, setInternal] = useState(defaultCollapsed);

  // Sync from persisted value after mount (avoids SSR hydration mismatch).
  // biome-ignore lint/correctness/useExhaustiveDependencies: run-once mount seed of persisted collapse state
  useEffect(() => {
    if (isControlled || persist === "none") return;
    const persisted = readPersisted(persist, storageKey);
    if (persisted !== null) setInternal(persisted);
  }, []);

  const collapsed = isControlled ? (controlledCollapsed as boolean) : internal;

  const setCollapsed = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternal(value);
        if (persist !== "none") writePersisted(persist, storageKey, value);
      }
      onCollapsedChange?.(value);
    },
    [isControlled, onCollapsedChange, persist, storageKey],
  );

  const toggle = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({ collapsed, toggle, setCollapsed }),
    [collapsed, toggle, setCollapsed],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

// ---------- Sidebar (aside) ----------

export function Sidebar({ className, children, ...props }: ComponentProps<"aside">) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "flex flex-col shrink-0 bg-sidebar text-sidebar-foreground shadow-xl",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-72",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

// ---------- SidebarHeader ----------

export interface SidebarHeaderProps {
  /** Logo element (always visible). SVG/icon recommended. */
  logo: ReactNode;
  /** App title (hidden when collapsed). */
  title?: ReactNode;
  /** Hide the built-in theme toggle. */
  hideThemeToggle?: boolean;
}

export function SidebarHeader({ logo, title, hideThemeToggle }: SidebarHeaderProps) {
  const { collapsed, toggle } = useSidebar();
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "min-h-[65px] border-b border-sidebar-border/50 p-4 pr-3",
        collapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-2",
      )}
    >
      <div className={cn("flex min-w-0 items-center gap-3", !collapsed && "flex-1")}>
        <span className="shrink-0 text-primary [&_svg]:h-6 [&_svg]:w-6">{logo}</span>
        {!collapsed && title && (
          <span className="truncate font-display text-xl font-medium tracking-tight text-sidebar-foreground">
            {title}
          </span>
        )}
      </div>
      <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
        {!hideThemeToggle && <ThemeToggle />}
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "expandir menu" : "recolher menu"}
          aria-label={collapsed ? "expandir menu" : "recolher menu"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sidebar-foreground/50 transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ---------- SidebarBody ----------

export function SidebarBody({ className, children, ...props }: ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea data-slot="sidebar-body" className={cn("flex-1 px-2 py-4", className)} {...props}>
      {children}
    </ScrollArea>
  );
}

// ---------- SidebarSectionLabel ----------

export function SidebarSectionLabel({ className, children, ...props }: ComponentProps<"p">) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <p
      data-slot="sidebar-section-label"
      className={cn(
        "mb-2 px-3 text-[10px] font-normal uppercase tracking-[0.22em] text-sidebar-foreground/50",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ---------- SidebarNavItem ----------

export interface SidebarNavItemProps {
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  /** Tooltip text shown when collapsed; defaults to `label` if it is a string. */
  title?: string;
  /** base-ui render-prop to swap the element for a router Link (e.g. next/link, wouter). */
  render?: (props: Record<string, unknown>) => ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SidebarNavItem({
  label,
  icon,
  active = false,
  title,
  render,
  onClick,
  className,
}: SidebarNavItemProps) {
  const { collapsed } = useSidebar();

  const classes = cn(
    "flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer",
    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
    className,
  );

  const inner = (
    <>
      {icon && <span className="shrink-0 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>}
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  );

  const elementProps: Record<string, unknown> = {
    className: classes,
    "data-slot": "sidebar-nav-item",
    "data-active": active || undefined,
    onClick,
    children: inner,
  };

  const element = render ? render(elementProps) : <button type="button" {...elementProps} />;

  if (!collapsed) return element;

  const tip = title ?? (typeof label === "string" ? label : undefined);
  if (!tip) return element;

  return (
    <Tooltip>
      <TooltipTrigger render={element as never} />
      <TooltipContent side="right">{tip}</TooltipContent>
    </Tooltip>
  );
}
