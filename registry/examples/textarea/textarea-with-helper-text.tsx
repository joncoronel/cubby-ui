import { Label } from "@/registry/default/label/label"
import { Textarea } from "@/registry/default/textarea/textarea"

export default function TextareaWithHelperText() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="description">Description</Label>
      <Textarea
        placeholder="Describe your project"
        id="description"
        rows={5}
      />
      <p className="text-sm text-muted-foreground">
        Write a brief description of your project. Markdown is supported.
      </p>
    </div>
  )
}