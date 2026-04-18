import { Kbd } from "@/registry/default/kbd/kbd";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
export default function InputGroupKeyboardShortcut() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon}  strokeWidth={2} />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Kbd>⌘K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}
