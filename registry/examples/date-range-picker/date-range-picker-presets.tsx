"use client";

import { useState } from "react";
import {
  DateRangePicker,
  type DateRangePreset,
  type DateRangeValue,
} from "@/registry/default/date-range-picker/date-range-picker";

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

const presets: DateRangePreset[] = [
  { label: "Today", value: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 days", value: () => ({ from: daysAgo(6), to: new Date() }) },
  {
    label: "Last 30 days",
    value: () => ({ from: daysAgo(29), to: new Date() }),
  },
  {
    label: "This month",
    value: () => {
      const today = new Date();
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: today,
      };
    },
  },
  {
    label: "Last month",
    value: () => {
      const today = new Date();
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      };
    },
  },
  {
    label: "Year to date",
    value: () => ({
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
    }),
  },
];

export default function DateRangePickerPresets() {
  const [range, setRange] = useState<DateRangeValue | null>(null);

  return (
    <DateRangePicker
      value={range}
      onValueChange={setRange}
      presets={presets}
      maxDate={new Date()}
    />
  );
}
