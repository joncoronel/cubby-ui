"use client";

import { useState } from "react";
import { Calendar } from "@/registry/default/calendar/calendar";

export default function CalendarDisabledDates() {
  const [date, setDate] = useState<Date | undefined>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      // No weekends, nothing in the past.
      disabled={[{ dayOfWeek: [0, 6] }, { before: today }]}
    />
  );
}
