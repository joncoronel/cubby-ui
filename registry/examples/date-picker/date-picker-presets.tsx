import {
  DatePicker,
  type DatePickerPreset,
} from "@/registry/default/date-picker/date-picker";

function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/** The next given weekday (0 = Sunday), never today. */
function next(weekday: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + (((weekday - date.getDay() + 6) % 7) + 1));
  return date;
}

const presets: DatePickerPreset[] = [
  { label: "Today", value: () => new Date() },
  { label: "Tomorrow", value: () => addDays(1) },
  { label: "Next Monday", value: () => next(1) },
  { label: "In a week", value: () => addDays(7) },
  { label: "In a month", value: () => addDays(30) },
];

export default function DatePickerPresets() {
  return <DatePicker presets={presets} placeholder="Due date" clearable />;
}
