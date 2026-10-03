import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";

export default function DateRangePickerMinMaxNights() {
  return (
    <DateRangePicker
      placeholder="Book a stay"
      minDate={new Date()}
      minNights={2}
      maxNights={14}
      showStatus
      // A stay is counted in nights, one fewer than the days it spans.
      labels={{
        duration: (days) => `${days - 1} ${days === 2 ? "night" : "nights"}`,
      }}
    />
  );
}
