"use client";

import { Loader2 } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return (
    <span data-slot="spinner" role="status" aria-label="Carregando" {...props}>
      <Loader2 className={cn("h-4 w-4 animate-spin text-muted-fg", className)} />
      <span className="sr-only">Carregando</span>
    </span>
  );
}
