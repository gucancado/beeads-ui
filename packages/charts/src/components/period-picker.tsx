"use client";

import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
  useIsMobile,
} from "@beeads/ui";
import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

export interface PeriodValue {
  from: Date;
  to: Date;
}

export interface PeriodPickerProps {
  value: PeriodValue;
  onChange: (next: PeriodValue) => void;
}

const today = () => new Date();

const presets: Array<{ label: string; build: () => PeriodValue }> = [
  { label: "últimos 7 dias", build: () => ({ from: subDays(today(), 6), to: today() }) },
  { label: "últimos 30 dias", build: () => ({ from: subDays(today(), 29), to: today() }) },
  { label: "últimos 90 dias", build: () => ({ from: subDays(today(), 89), to: today() }) },
  { label: "este mês", build: () => ({ from: startOfMonth(today()), to: today() }) },
  {
    label: "mês passado",
    build: () => {
      const last = subMonths(today(), 1);
      return { from: startOfMonth(last), to: addDays(startOfMonth(today()), -1) };
    },
  },
];

export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="gap-2 font-normal">
            <CalendarIcon className="h-4 w-4" />
            {format(value.from, "dd/MM/yyyy")} – {format(value.to, "dd/MM/yyyy")}
          </Button>
        }
      />
      <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] p-0" align="end">
        <div className={cn("flex", isMobile && "flex-col")}>
          <div
            className={cn(
              "flex gap-1 p-2",
              isMobile
                ? "flex-row flex-wrap border-b border-border"
                : "flex-col border-r border-border",
            )}
          >
            {presets.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(p.build());
                  setOpen(false);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            defaultMonth={value.from}
            selected={{ from: value.from, to: value.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
