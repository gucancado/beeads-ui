"use client";

import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@beeads/ui";

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
  { label: "Últimos 7 dias", build: () => ({ from: subDays(today(), 6), to: today() }) },
  { label: "Últimos 30 dias", build: () => ({ from: subDays(today(), 29), to: today() }) },
  { label: "Últimos 90 dias", build: () => ({ from: subDays(today(), 89), to: today() }) },
  { label: "Este mês", build: () => ({ from: startOfMonth(today()), to: today() }) },
  {
    label: "Mês passado",
    build: () => {
      const last = subMonths(today(), 1);
      return { from: startOfMonth(last), to: addDays(startOfMonth(today()), -1) };
    },
  },
];

export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="gap-2 font-normal">
            <CalendarIcon className="h-4 w-4" />
            {format(value.from, "d MMM", { locale: ptBR })} – {format(value.to, "d MMM y", { locale: ptBR })}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r border-border p-2">
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
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
