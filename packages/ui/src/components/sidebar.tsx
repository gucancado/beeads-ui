"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";
import { TooltipProvider } from "./tooltip";

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
  useEffect(() => {
    if (isControlled || persist === "none") return;
    const persisted = readPersisted(persist, storageKey);
    if (persisted !== null) setInternal(persisted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
