"use client";

import { Calendar } from "@/registry/default/calendar/calendar";
import { useState } from "react";

export default function CalendarSingleDateSelection() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-3">
      <Calendar mode="single" selected={date} onSelect={setDate} />
      <p className="text-muted-foreground text-center text-sm">
        Selected date: {date?.toDateString()}
      </p>
    </div>
  );
}
