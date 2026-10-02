"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/registry/default/calendar/calendar";

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export default function CalendarDateRangeSelection() {
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: addDays(today, 2), to: addDays(today, 9) };
  });

  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
    />
  );
}
