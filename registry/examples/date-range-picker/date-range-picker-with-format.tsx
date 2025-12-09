"use client";

import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function DateRangePickerWithFormat() {
  const [datePreset, setDatePreset] = useState<DateRange | undefined>();

  return (
    <DateRangePicker
      value={datePreset}
      onSelect={setDatePreset}
      format="MMM DD, YYYY"
    />
  );
}