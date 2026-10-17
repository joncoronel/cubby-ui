import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxTone() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="tone-neutral" defaultChecked />
        <Label htmlFor="tone-neutral">Neutral</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="tone-primary" tone="primary" defaultChecked />
        <Label htmlFor="tone-primary">Primary</Label>
      </div>
    </div>
  );
}
