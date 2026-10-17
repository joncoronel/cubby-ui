import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxColor() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="color-neutral" defaultChecked />
        <Label htmlFor="color-neutral">Neutral</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="color-primary" color="primary" defaultChecked />
        <Label htmlFor="color-primary">Primary</Label>
      </div>
    </div>
  );
}
