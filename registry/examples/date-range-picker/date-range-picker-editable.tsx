"use client";

import { useState } from "react";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/registry/default/date-range-picker/date-range-picker";

export default function DateRangePickerEditable() {
  const [range, setRange] = useState<DateRangeValue | null>(null);

  return (
    <DateRangePicker
      editable
      clearable
      value={range}
      onValueChange={setRange}
      placeholder="Try “last 30 days” or “mar 3 – 12”"
      className="w-80"
    />
  );
}
