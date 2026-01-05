import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function LabelDemo() {
  return (
    <Label>
      Email address
      <Input type="email" placeholder="you@example.com" />
    </Label>
  );
}
