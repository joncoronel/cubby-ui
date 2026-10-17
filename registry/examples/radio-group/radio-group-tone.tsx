import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";

export default function RadioGroupTone() {
  return (
    <div className="flex gap-10">
      <RadioGroup defaultValue="neutral-a" aria-label="Neutral tone">
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="neutral-a" />
          Neutral
        </Label>
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="neutral-b" />
          Option
        </Label>
      </RadioGroup>
      <RadioGroup defaultValue="primary-a" aria-label="Primary tone">
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="primary-a" tone="primary" />
          Primary
        </Label>
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="primary-b" tone="primary" />
          Option
        </Label>
      </RadioGroup>
    </div>
  );
}
