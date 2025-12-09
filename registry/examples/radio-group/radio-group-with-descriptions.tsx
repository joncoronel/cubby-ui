import { RadioGroup, RadioGroupItem } from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";

export default function RadioGroupWithDescriptions() {
  return (
    <RadioGroup defaultValue="standard">
      <div className="flex items-start space-x-2 mb-4">
        <RadioGroupItem value="free" id="free" className="mt-0.5" />
        <div>
          <Label htmlFor="free" className="font-medium">Free Plan</Label>
          <p className="text-sm text-muted-foreground">
            Basic features for personal use
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2 mb-4">
        <RadioGroupItem value="standard" id="standard" className="mt-0.5" />
        <div>
          <Label htmlFor="standard" className="font-medium">Standard Plan</Label>
          <p className="text-sm text-muted-foreground">
            Advanced features for teams
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="premium" id="premium" className="mt-0.5" />
        <div>
          <Label htmlFor="premium" className="font-medium">Premium Plan</Label>
          <p className="text-sm text-muted-foreground">
            All features with priority support
          </p>
        </div>
      </div>
    </RadioGroup>
  );
}