"use client";

import { useState } from "react";
import { Calendar } from "@/registry/default/calendar/calendar";

export default function CalendarWithFooter() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      footer={
        date
          ? `Appointment on ${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`
          : "Pick a day for your appointment."
      }
    />
  );
}
