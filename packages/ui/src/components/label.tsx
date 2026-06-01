"use client";

import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: primitive Label associated with a control by consumers via htmlFor or nesting; association cannot be enforced here
    <label
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
