"use client";

import { Input, cn } from "@beeads/ui";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";

export interface FilterBarProps extends ComponentProps<"div"> {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function FilterBar({
  className,
  searchPlaceholder = "buscar…",
  searchValue,
  onSearchChange,
  children,
  ...props
}: FilterBarProps) {
  return (
    <div
      data-slot="filter-bar"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-fg" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-8"
        />
      </div>
      {children}
    </div>
  );
}
