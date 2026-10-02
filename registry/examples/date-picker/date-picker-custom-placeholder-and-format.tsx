import { DatePicker } from "@/registry/default/date-picker/date-picker";

const longDate = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "long",
  day: "numeric",
});

export default function DatePickerCustomPlaceholderAndFormat() {
  return (
    <DatePicker
      placeholder="When's the launch?"
      format={(date) => longDate.format(date)}
    />
  );
}
