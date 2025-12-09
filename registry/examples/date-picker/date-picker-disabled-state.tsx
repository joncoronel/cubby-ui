import { DatePicker } from "@/registry/default/date-picker/date-picker";

export default function DatePickerDisabledState() {
  return (
    <div className="space-y-3">
      <DatePicker disabled placeholder="Disabled date picker" />
      <DatePicker
        value={new Date()}
        disabled
        placeholder="Disabled with value"
      />
    </div>
  );
}