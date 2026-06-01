"use client";

import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Empty({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-12 text-center",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyIcon({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-muted-fg [&>svg]:size-10", className)} {...props} />;
}

export function EmptyTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("font-display text-base font-medium", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("max-w-sm text-sm text-muted-fg", className)} {...props} />;
}
