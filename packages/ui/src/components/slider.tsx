"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Slider({
  className,
  ...props
}: ComponentProps<typeof BaseSlider.Root>) {
  return (
    <BaseSlider.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <BaseSlider.Control className="relative w-full">
        <BaseSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <BaseSlider.Indicator className="absolute h-full bg-primary" />
        </BaseSlider.Track>
        <BaseSlider.Thumb
          className={cn(
            "block h-4 w-4 rounded-full border border-primary bg-card shadow",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        />
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
