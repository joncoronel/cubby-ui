import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";

export default function SwitchMotion() {
  return (
    <div className="flex flex-col gap-3">
      <Label
        className="hover:bg-surface-hover group/switch -mx-2 flex-row items-center justify-between rounded-md px-3 py-2"
        htmlFor="motion-default"
      >
        default
        <Switch defaultChecked id="motion-default" />
      </Label>
      <Label
        className="hover:bg-surface-hover group/switch -mx-2 flex-row items-center justify-between rounded-md px-3 py-2"
        htmlFor="motion-stretch"
      >
        stretch
        <Switch defaultChecked id="motion-stretch" motion="stretch" />
      </Label>
    </div>
  );
}
