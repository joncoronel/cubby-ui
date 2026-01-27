import { RadioGroup, RadioGroupItem } from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";

export default function RadioGroupDisabledOptions() {
  return (
    <RadioGroup defaultValue="option2">
      <Label className="flex-row items-center gap-2">
        <RadioGroupItem value="option1" />
        Available Option
      </Label>
      <Label className="flex-row items-center gap-2">
        <RadioGroupItem value="option2" />
        Selected Option
      </Label>
      <Label className="flex-row items-center gap-2 opacity-50">
        <RadioGroupItem value="option3" disabled />
        Disabled Option
      </Label>
    </RadioGroup>
  );
}