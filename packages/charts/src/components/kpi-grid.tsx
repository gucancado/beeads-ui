"use client";

import { cn } from "@beeads/ui";
import type { ComponentProps } from "react";

export function KpiGrid({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="kpi-grid"
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-6",
        className,
      )}
      {...props}
    />
  );
}
