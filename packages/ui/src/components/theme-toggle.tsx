"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/theme-provider";
import { Button } from "./button";

export interface ThemeToggleProps {
  /** Tamanho do botão (default "icon") */
  size?: "icon" | "sm" | "default" | "lg" | "xs";
}

export function ThemeToggle({ size = "icon" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Trocar tema</span>
    </Button>
  );
}
