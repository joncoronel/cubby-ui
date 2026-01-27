import { RadioGroup, RadioGroupItem } from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";

export default function RadioGroupWithDescriptions() {
  return (
    <RadioGroup defaultValue="standard">
      <Label className="flex-row items-start gap-2 mb-4">
        <RadioGroupItem value="free" className="mt-0.5" />
        <div>
          <span className="font-medium">Free Plan</span>
          <p className="text-sm text-muted-foreground font-normal">
            Basic features for personal use
          </p>
        </div>
      </Label>
      <Label className="flex-row items-start gap-2 mb-4">
        <RadioGroupItem value="standard" className="mt-0.5" />
        <div>
          <span className="font-medium">Standard Plan</span>
          <p className="text-sm text-muted-foreground font-normal">
            Advanced features for teams
          </p>
        </div>
      </Label>
      <Label className="flex-row items-start gap-2">
        <RadioGroupItem value="premium" className="mt-0.5" />
        <div>
          <span className="font-medium">Premium Plan</span>
          <p className="text-sm text-muted-foreground font-normal">
            All features with priority support
          </p>
        </div>
      </Label>
    </RadioGroup>
  );
}