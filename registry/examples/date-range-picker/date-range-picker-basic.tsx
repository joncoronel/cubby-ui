"use client";

import { useState } from "react";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/registry/default/date-range-picker/date-range-picker";

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export default function DateRangePickerBasic() {
  const [range, setRange] = useState<DateRangeValue | null>(() => {
    const today = new Date();
    return { from: today, to: addDays(today, 7) };
  });

  return <DateRangePicker value={range} onValueChange={setRange} clearable />;
}
