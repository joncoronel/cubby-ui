import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";

export default function InputGroupSize() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      {(["sm", "default"] as const).map((size) => (
        <InputGroup key={size} size={size}>
          <InputGroupInput placeholder="Search..." defaultValue="Invoices" />
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon" aria-label="Clear">
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ))}
    </div>
  );
}
