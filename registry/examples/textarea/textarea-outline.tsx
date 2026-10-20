import { Label } from "@/registry/default/label/label";
import { Textarea } from "@/registry/default/textarea/textarea";

export default function TextareaOutline() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="textarea-outline">Message</Label>
      <Textarea
        id="textarea-outline"
        variant="outline"
        placeholder="Write a short note..."
      />
    </div>
  );
}
