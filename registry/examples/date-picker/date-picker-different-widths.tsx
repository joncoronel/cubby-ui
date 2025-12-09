import { DatePicker } from "@/registry/default/date-picker/date-picker";

export default function DatePickerDifferentWidths() {
  return (
    <div className="space-y-3">
      <DatePicker className="w-[200px]" placeholder="Narrow" />
      <DatePicker className="w-[300px]" placeholder="Default" />
      <DatePicker className="w-[400px]" placeholder="Wide" />
    </div>
  );
}