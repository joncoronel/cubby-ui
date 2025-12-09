import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupDisabledOptions() {
  return (
    <CheckboxGroup>
      <div className="flex items-center space-x-2">
        <Checkbox id="read" defaultChecked />
        <Label htmlFor="read">Read</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="write" />
        <Label htmlFor="write">Write</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="admin" disabled />
        <Label htmlFor="admin" className="text-muted-foreground">
          Admin (requires upgrade)
        </Label>
      </div>
    </CheckboxGroup>
  );
}