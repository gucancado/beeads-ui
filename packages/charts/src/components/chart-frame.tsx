"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beeads/ui";
import type { ComponentProps, ReactNode } from "react";

interface ChartFrameProps extends Omit<ComponentProps<typeof Card>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export function ChartFrame({
  title,
  description,
  actions,
  footer,
  children,
  className,
  ...props
}: ChartFrameProps) {
  return (
    <Card data-slot="chart-frame" className={className} {...props}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="flex flex-col gap-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && (
        <div className="border-t border-border px-6 py-3 text-xs text-muted-fg">{footer}</div>
      )}
    </Card>
  );
}
