"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
    "transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-fg",
        secondary: "border-transparent bg-secondary text-secondary-fg",
        accent: "border-transparent bg-accent text-accent-fg",
        destructive: "border-transparent bg-destructive text-destructive-fg",
        outline: "text-fg",
        ok: "border-transparent bg-ok/15 text-ok",
        warn: "border-transparent bg-warn/15 text-warn",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends ComponentProps<"div">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
