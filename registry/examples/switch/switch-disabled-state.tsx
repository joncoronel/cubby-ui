import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";

export default function SwitchDisabledState() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Switch id="disabled-off" disabled />
        <Label htmlFor="disabled-off" className="text-muted-foreground">
          Disabled (off)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-on" disabled checked />
        <Label htmlFor="disabled-on" className="text-muted-foreground">
          Disabled (on)
        </Label>
      </div>
    </div>
  );
}