import { Label } from "@/registry/default/label/label"
import { Textarea } from "@/registry/default/textarea/textarea"

export default function TextareaDisabledState() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="disabled-example">Comments (Disabled)</Label>
      <Textarea
        placeholder="Comments are disabled"
        id="disabled-example"
        disabled
      />
    </div>
  )
}