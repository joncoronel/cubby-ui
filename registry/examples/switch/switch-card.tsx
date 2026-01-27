import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";

export default function SwitchCard() {
  return (
    <Label
      htmlFor="notifications"
      className="flex-row items-start justify-between gap-4 rounded-lg border bg-card p-4 has-data-checked:border-primary/50 has-data-checked:bg-muted hover:bg-muted"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium">Push Notifications</span>
        <span className="text-muted-foreground text-sm">
          Receive notifications when someone mentions you.
        </span>
      </div>
      <Switch className="[--thumb-size:--spacing(4)]" id="notifications" />
    </Label>
  );
}
