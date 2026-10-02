import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";

const numeric = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function DateRangePickerWithFormat() {
  return (
    <DateRangePicker
      format={({ from, to }) =>
        `${numeric.format(from)} → ${numeric.format(to)}`
      }
    />
  );
}
