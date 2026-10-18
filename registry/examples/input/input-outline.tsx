import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function InputOutline() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-outline">Email</Label>
      <Input
        id="input-outline"
        type="email"
        variant="outline"
        placeholder="you@example.com"
      />
    </div>
  );
}
