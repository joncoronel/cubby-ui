"use client";

import { Calendar } from "@/registry/default/calendar/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function CalendarDateRangeSelection() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: new Date(2024, 0, 25),
  });

  return (
    <div className="space-y-3">
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={setDateRange}
        numberOfMonths={2}
        fixedWeeks
      />
      <p className="text-muted-foreground text-center text-sm">
        {dateRange?.from ? (
          dateRange.to ? (
            <>
              {dateRange.from.toDateString()} - {dateRange.to.toDateString()}
            </>
          ) : (
            dateRange.from.toDateString()
          )
        ) : (
          "Pick a date range"
        )}
      </p>
    </div>
  );
}
