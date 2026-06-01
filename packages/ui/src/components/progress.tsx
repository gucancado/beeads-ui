"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Progress({ className, ...props }: ComponentProps<typeof BaseProgress.Root>) {
  return (
    <BaseProgress.Root
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <BaseProgress.Track className="block h-full w-full overflow-hidden rounded-full bg-muted">
        <BaseProgress.Indicator className="block h-full bg-primary transition-all" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
