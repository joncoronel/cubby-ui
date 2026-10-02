"use client";

import { useState } from "react";
import { Calendar } from "@/registry/default/calendar/calendar";

export default function CalendarSingleDateSelection() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      footer={
        date
          ? `Selected ${date.toLocaleDateString(undefined, { dateStyle: "long" })}`
          : "Pick a day."
      }
    />
  );
}
