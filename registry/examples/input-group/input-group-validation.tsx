import { AlertCircleIcon, CheckCircleIcon, Mail } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";

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
          <Mail />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <AlertCircleIcon className="text-destructive size-4" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput
          type="email"
          placeholder="Email"
          defaultValue="user@example.com"
        />
        <InputGroupAddon>
          <Mail />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <CheckCircleIcon className="size-4 text-emerald-500" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
