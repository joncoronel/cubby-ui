import { DatePicker } from "@/registry/default/date-picker/date-picker";

export default function DatePickerDisabledState() {
  return <DatePicker disabled defaultValue={new Date()} />;
}
