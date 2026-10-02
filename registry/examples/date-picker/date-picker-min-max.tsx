import { DatePicker } from "@/registry/default/date-picker/date-picker";

const today = new Date();
const inSixtyDays = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 60,
);

export default function DatePickerMinMax() {
  return (
    <DatePicker
      placeholder="Delivery date"
      minDate={today}
      maxDate={inSixtyDays}
      // Weekends are blocked too.
      disabledDates={{ dayOfWeek: [0, 6] }}
    />
  );
}
