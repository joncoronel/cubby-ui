"use client";

import { Calendar } from "@/registry/default/calendar/calendar";
import { useState } from "react";

export default function CalendarDisabledDates() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={(date) =>
        date > new Date() || date < new Date("1900-01-01")
      }
      initialFocus
    />
  );
}