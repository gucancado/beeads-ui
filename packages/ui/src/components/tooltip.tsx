"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

export function TooltipContent({
  className,
  sideOffset = 4,
  side,
  ...props
}: ComponentProps<typeof BaseTooltip.Popup> & {
  sideOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner sideOffset={sideOffset} side={side} className="z-50">
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={cn(
            "overflow-hidden rounded-md border border-border bg-card px-3 py-1.5 text-xs text-card-fg shadow-md",
            className,
          )}
          {...props}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
