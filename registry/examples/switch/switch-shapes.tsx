import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";

export default function SwitchShapes() {
  return (
    <div className="flex items-center gap-6">
      <Label className="flex-row items-center gap-2" htmlFor="shape-circle">
        <Switch defaultChecked id="shape-circle" />
        circle
      </Label>
      <Label className="flex-row items-center gap-2" htmlFor="shape-pill">
        <Switch defaultChecked id="shape-pill" shape="pill" />
        pill
      </Label>
      <Label className="flex-row items-center gap-2" htmlFor="shape-square">
        <Switch defaultChecked id="shape-square" shape="square" />
        square
      </Label>
    </div>
  );
}
