import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";
import { Label } from "@/registry/default/label/label";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

export default function InputGroupOutline() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-group-outline">Search</Label>
      <InputGroup variant="outline">
        <InputGroupInput
          id="input-group-outline"
          placeholder="Search components..."
        />
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
