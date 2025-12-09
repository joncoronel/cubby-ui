"use client";

import { Calendar } from "@/registry/default/calendar/calendar";
import { useState } from "react";

export default function CalendarWithFooter() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      footer={
        <p className="text-muted-foreground mt-1 text-center text-sm">
          Pick a date for your appointment
        </p>
      }
    />
  );
}
