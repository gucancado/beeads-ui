"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function Field({ className, ...props }: ComponentProps<typeof BaseField.Root>) {
  return (
    <BaseField.Root
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

export function FieldLabel({ className, ...props }: ComponentProps<typeof BaseField.Label>) {
  return (
    <BaseField.Label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

export function FieldControl({ ...props }: ComponentProps<typeof BaseField.Control>) {
  return <BaseField.Control {...props} />;
}

export function FieldDescription({ className, ...props }: ComponentProps<typeof BaseField.Description>) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn("text-xs text-muted-fg", className)}
      {...props}
    />
  );
}

export function FieldError({ className, ...props }: ComponentProps<typeof BaseField.Error>) {
  return (
    <BaseField.Error
      data-slot="field-error"
      className={cn("text-xs text-destructive", className)}
      {...props}
    />
  );
}
