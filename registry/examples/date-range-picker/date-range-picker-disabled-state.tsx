import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";

const today = new Date();

export default function DateRangePickerDisabledState() {
  return (
    <DateRangePicker
      disabled
      defaultValue={{
        from: today,
        to: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 7,
        ),
      }}
    />
  );
}
