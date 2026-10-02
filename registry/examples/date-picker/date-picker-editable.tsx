"use client";

import { useState } from "react";
import { DatePicker } from "@/registry/default/date-picker/date-picker";

export default function DatePickerEditable() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <DatePicker
        editable
        clearable
        value={date}
        onValueChange={setDate}
        placeholder="Try “next fri” or “mar 14”"
        className="w-72"
      />
      <p className="text-muted-foreground text-sm tabular-nums">
        {date ? date.toDateString() : "No date"}
      </p>
    </div>
  );
}
