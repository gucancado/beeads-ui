"use client";

import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button";

const NAV_BUTTON =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-fg/70 transition-colors hover:bg-accent hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30";

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // react-day-picker v10 keys (snake_case)
        months: "relative flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        // Nav numa faixa própria na altura do título do mês: área de clique
        // 36x36 e 16px (gap do month) até os dias da semana.
        month_caption: "flex h-9 items-center justify-center px-10",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between",
        button_previous: NAV_BUTTON,
        button_next: NAV_BUTTON,
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-fg rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-8 w-8 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-fg hover:bg-primary hover:text-primary-fg focus:bg-primary focus:text-primary-fg",
        today: "bg-accent text-accent-fg",
        outside: "text-muted-fg opacity-50",
        disabled: "text-muted-fg opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-fg",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
