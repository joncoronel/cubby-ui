import { RadioGroup, RadioGroupItem } from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";

export default function RadioGroupDisabledOptions() {
  return (
    <RadioGroup defaultValue="option2">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Available Option</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Selected Option</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" disabled />
        <Label htmlFor="option3" className="opacity-50">
          Disabled Option
        </Label>
      </div>
    </RadioGroup>
  );
}