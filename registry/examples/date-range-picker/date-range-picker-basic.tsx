"use client";

import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";

export default function DateRangePickerBasic() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: dayjs().add(7, 'day').toDate(),
  });

  return (
    <DateRangePicker
      value={date}
      onSelect={setDate}
    />
  );
}