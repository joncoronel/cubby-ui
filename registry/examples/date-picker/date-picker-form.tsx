"use client";

import { useState } from "react";
import { Button } from "@/registry/default/button/button";
import { DatePicker } from "@/registry/default/date-picker/date-picker";

export default function DatePickerForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col items-start gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(String(data.get("birthday") || "(empty)"));
      }}
    >
      <label htmlFor="birthday" className="text-sm font-medium">
        Birthday
      </label>
      <DatePicker id="birthday" name="birthday" />
      <Button type="submit" size="sm">
        Submit
      </Button>
      {submitted && (
        <p className="text-muted-foreground font-mono text-sm">
          birthday={submitted}
        </p>
      )}
    </form>
  );
}
