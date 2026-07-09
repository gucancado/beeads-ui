"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Spinner is a typed inline ComponentProps<"span"> primitive; role="status" is the correct live-region semantic without forcing an <output> element on consumers
    <span data-slot="spinner" role="status" aria-label="carregando" {...props}>
      <Loader2 className={cn("h-4 w-4 animate-spin text-muted-fg", className)} />
      <span className="sr-only">carregando</span>
    </span>
  );
}
