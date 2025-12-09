"use client";

import { DatePicker } from "@/registry/default/date-picker/date-picker";
import { useState } from "react";

export default function DatePickerCustomPlaceholderAndFormat() {
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  return (
    <DatePicker
      placeholder="Pick your birth date"
      format="MMM DD, YYYY"
      value={birthDate}
      onSelect={setBirthDate}
    />
  );
}