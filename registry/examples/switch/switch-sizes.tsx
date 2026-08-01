import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";

export default function SwitchSizes() {
  return (
    <div className="flex items-center gap-6">
      <Label className="flex-row items-center gap-2" htmlFor="size-xs">
        <Switch defaultChecked id="size-xs" size="xs" />
        xs
      </Label>
      <Label className="flex-row items-center gap-2" htmlFor="size-sm">
        <Switch defaultChecked id="size-sm" size="sm" />
        sm
      </Label>
      <Label className="flex-row items-center gap-2" htmlFor="size-default">
        <Switch defaultChecked id="size-default" />
        default
      </Label>
    </div>
  );
}
