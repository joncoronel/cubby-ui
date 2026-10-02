"use client";

import { useState } from "react";
import { Calendar } from "@/registry/default/calendar/calendar";

export default function CalendarMonthAndYear() {
  const [date, setDate] = useState<Date | undefined>(new Date(1994, 4, 21));

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      // Bounds the month and year grids as well as the arrows.
      startMonth={new Date(1920, 0)}
      endMonth={new Date()}
    />
  );
}
