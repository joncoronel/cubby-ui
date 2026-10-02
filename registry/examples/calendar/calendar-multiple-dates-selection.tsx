"use client";

import { useState } from "react";
import { Calendar } from "@/registry/default/calendar/calendar";

export default function CalendarMultipleDatesSelection() {
  const [dates, setDates] = useState<Date[] | undefined>([]);

  return (
    <Calendar
      mode="multiple"
      selected={dates}
      onSelect={setDates}
      footer={`${dates?.length ?? 0} ${dates?.length === 1 ? "day" : "days"} selected`}
    />
  );
}
