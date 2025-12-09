"use client";

import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function DateRangePickerWithPlaceholder() {
  const [date, setDate] = useState<DateRange | undefined>();

  return (
    <DateRangePicker
      value={date}
      onSelect={setDate}
      placeholder="Custom date range placeholder"
    />
  );
}
