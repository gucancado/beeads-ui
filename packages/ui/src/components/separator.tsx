"use client";

import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    // biome-ignore lint/a11y/useFocusableInteractive: decorative/structural separator, not an adjustable splitter; intentionally non-focusable per WAI-ARIA static separator pattern
    <div
      data-slot="separator"
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
