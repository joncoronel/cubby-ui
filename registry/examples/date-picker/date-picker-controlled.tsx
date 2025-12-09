"use client";

import { DatePicker } from "@/registry/default/date-picker/date-picker";
import { useState } from "react";

export default function DatePickerControlled() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div className="space-y-2">
      <DatePicker value={date} onSelect={setDate} />
      <p className="text-sm text-muted-foreground">
        Selected date: {date ? date.toDateString() : "None"}
      </p>
    </div>
  );
}