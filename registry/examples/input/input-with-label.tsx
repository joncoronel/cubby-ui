import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function InputWithLabel() {
  return (
    <Label>
      Email
      <Input id="email" placeholder="Enter your email" type="email" />
    </Label>
  );
}
