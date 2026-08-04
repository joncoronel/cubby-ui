import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";

export default function SwitchColor() {
  return (
    <div className="flex items-center gap-6">
      <Label className="flex-row items-center gap-2" htmlFor="color-primary">
        <Switch defaultChecked id="color-primary" />
        primary
      </Label>
      <Label className="flex-row items-center gap-2" htmlFor="color-neutral">
        <Switch defaultChecked color="neutral" id="color-neutral" />
        neutral
      </Label>
      <Label className="flex-row items-center gap-2" htmlFor="color-custom">
        <Switch
          className="[--switch-fill:var(--color-emerald-600)]"
          defaultChecked
          id="color-custom"
        />
        custom
      </Label>
    </div>
  );
}
