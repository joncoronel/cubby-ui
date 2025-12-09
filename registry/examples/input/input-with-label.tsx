import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function InputWithLabel() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="Enter your email" type="email" />
    </div>
  );
}
