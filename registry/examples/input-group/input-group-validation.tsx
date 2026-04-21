import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, CheckmarkCircle02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
export default function InputGroupValidation() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput
          type="email"
          placeholder="Email"
          defaultValue="invalid-email"
          aria-invalid="true"
        />
        <InputGroupAddon>
          <HugeiconsIcon icon={Mail01Icon}  strokeWidth={2} />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <HugeiconsIcon icon={AlertCircleIcon} className="text-destructive size-4"  strokeWidth={2} />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput
          type="email"
          placeholder="Email"
          defaultValue="user@example.com"
        />
        <InputGroupAddon>
          <HugeiconsIcon icon={Mail01Icon}  strokeWidth={2} />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500"  strokeWidth={2} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
