import { Checkbox } from "@/registry/default/checkbox/checkbox"
import { Label } from "@/registry/default/label/label"

export default function CheckboxWithLabel() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">
        Accept terms and conditions
      </Label>
    </div>
  )
}