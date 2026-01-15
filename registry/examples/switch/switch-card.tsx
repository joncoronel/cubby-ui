import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";

export default function SwitchCard() {
  return (
    <Label
      htmlFor="notifications"
      className="has-[data-checked]:border-primary has-[data-checked]:bg-accent cursor-pointer flex-row items-center justify-between gap-4 rounded-lg border p-4"
    >
      <div className="space-y-0.5">
        <div className="font-medium">Push Notifications</div>
        <div className="text-muted-foreground text-sm">
          Receive notifications when someone mentions you.
        </div>
      </div>
      <Switch className="[--thumb-size:--spacing(4)]" id="notifications" />
    </Label>
  );
}
