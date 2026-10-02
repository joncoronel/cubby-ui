import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";

export default function DateRangePickerMinMaxNights() {
  return (
    <DateRangePicker
      placeholder="Book a stay"
      minDate={new Date()}
      minNights={2}
      maxNights={14}
    />
  );
}
