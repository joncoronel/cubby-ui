import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive02Icon,
  Cancel01Icon,
  Delete02Icon,
  FolderTransferIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";

export default function ButtonGroupTextExample() {
  return (
    <ButtonGroup
      variant="elevated"
      aria-label="Selected files"
      className="[--radius:9999px]"
    >
      <ButtonGroupText>3 selected</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="Move">
        <HugeiconsIcon icon={FolderTransferIcon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Add label">
        <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Archive">
        <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Delete">
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
      </Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="Clear selection">
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
