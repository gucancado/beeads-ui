"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { useTheme } from "../providers/theme-provider";

export function Toaster() {
  const { theme = "system" } = useTheme();
  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-fg group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-fg",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-fg",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-fg",
        },
      }}
    />
  );
}

export { toast };
