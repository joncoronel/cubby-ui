import { Checkbox } from "@/registry/default/checkbox/checkbox"
import { Label } from "@/registry/default/label/label"

export default function CheckboxDisabledState() {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled1" disabled />
        <Label htmlFor="disabled1" className="text-muted-foreground">
          Disabled unchecked
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled2" disabled checked />
        <Label htmlFor="disabled2" className="text-muted-foreground">
          Disabled checked
        </Label>
      </div>
    </div>
  )
}