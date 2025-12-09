"use client";

import { Calendar } from "@/registry/default/calendar/calendar";
import { useState } from "react";

export default function CalendarMultipleDatesSelection() {
  const [dates, setDates] = useState<Date[] | undefined>([]);

  return (
    <div className="space-y-3">
      <Calendar mode="multiple" selected={dates} onSelect={setDates} />
      <div className="text-muted-foreground text-center text-sm">
        <p>Selected dates: {dates?.length || 0}</p>
        {dates && dates.length > 0 && (
          <p className="mt-1 text-xs">
            {dates.map((d) => d.toLocaleDateString()).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
