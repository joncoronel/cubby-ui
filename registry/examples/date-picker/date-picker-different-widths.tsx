import { DatePicker } from "@/registry/default/date-picker/date-picker";

export default function DatePickerDifferentWidths() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <DatePicker className="w-48" placeholder="Narrow" />
      <DatePicker placeholder="Default" />
      <DatePicker className="w-full" placeholder="Full width" />
    </div>
  );
}
