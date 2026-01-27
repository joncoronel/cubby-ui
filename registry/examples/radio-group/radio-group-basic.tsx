import { RadioGroup, RadioGroupItem } from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";

export default function RadioGroupBasic() {
  return (
    <RadioGroup defaultValue="comfortable">
      <Label className="flex-row items-center gap-2">
        <RadioGroupItem value="default" />
        Default
      </Label>
      <Label className="flex-row items-center gap-2">
        <RadioGroupItem value="comfortable" />
        Comfortable
      </Label>
      <Label className="flex-row items-center gap-2">
        <RadioGroupItem value="compact" />
        Compact
      </Label>
    </RadioGroup>
  );
}