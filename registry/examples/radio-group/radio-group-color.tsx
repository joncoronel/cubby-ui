import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";

export default function RadioGroupColor() {
  return (
    <div className="flex gap-10">
      <RadioGroup defaultValue="neutral-a" aria-label="Neutral color">
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="neutral-a" />
          Neutral
        </Label>
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="neutral-b" />
          Option
        </Label>
      </RadioGroup>
      <RadioGroup defaultValue="primary-a" aria-label="Primary color">
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="primary-a" color="primary" />
          Primary
        </Label>
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="primary-b" color="primary" />
          Option
        </Label>
      </RadioGroup>
    </div>
  );
}
