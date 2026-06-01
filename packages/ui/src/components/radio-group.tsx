"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export function RadioGroup({ className, ...props }: ComponentProps<typeof BaseRadioGroup>) {
  return (
    <BaseRadioGroup data-slot="radio-group" className={cn("grid gap-2", className)} {...props} />
  );
}

export function RadioGroupItem({ className, ...props }: ComponentProps<typeof BaseRadio.Root>) {
  return (
    <BaseRadio.Root
      data-slot="radio-group-item"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-input text-primary shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <BaseRadio.Indicator className="flex items-center justify-center after:block after:h-2 after:w-2 after:rounded-full after:bg-current" />
    </BaseRadio.Root>
  );
}
