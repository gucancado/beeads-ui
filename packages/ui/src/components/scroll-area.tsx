"use client";

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import type { ComponentProps, Ref } from "react";
import { cn } from "../lib/utils";

export function ScrollArea({
  className,
  children,
  viewportRef,
  ...props
}: ComponentProps<typeof BaseScrollArea.Root> & {
  /** Ref to the scrollable viewport element (e.g. for scroll restoration). */
  viewportRef?: Ref<HTMLDivElement>;
}) {
  return (
    <BaseScrollArea.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <BaseScrollArea.Viewport ref={viewportRef} className="h-full w-full rounded-[inherit]">
        {children}
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar
        orientation="vertical"
        className="flex h-full w-2.5 touch-none select-none p-0.5"
      >
        <BaseScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar
        orientation="horizontal"
        className="flex h-2.5 w-full touch-none select-none p-0.5"
      >
        <BaseScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
