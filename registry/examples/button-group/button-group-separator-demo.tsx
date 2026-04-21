import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { ClipboardIcon, Copy01Icon } from "@hugeicons/core-free-icons";
export default function ButtonGroupSeparatorDemo() {
  return (
    <ButtonGroup>
      <Button leftSection={<HugeiconsIcon icon={Copy01Icon}  strokeWidth={2} />} variant="secondary">
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button leftSection={<HugeiconsIcon icon={ClipboardIcon}  strokeWidth={2} />} variant="secondary">
        Paste
      </Button>
    </ButtonGroup>
  );
}
