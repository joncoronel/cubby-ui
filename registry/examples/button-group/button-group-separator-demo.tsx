import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Comment01Icon,
  Link04Icon,
  PlayIcon,
  Redo02Icon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";

export default function ButtonGroupSeparatorDemo() {
  return (
    <ButtonGroup variant="soft" aria-label="Editor">
      <Button size="icon" aria-label="Undo">
        <HugeiconsIcon icon={Undo02Icon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Redo" disabled>
        <HugeiconsIcon icon={Redo02Icon} strokeWidth={2} />
      </Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="Comment">
        <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} />
      </Button>
      <Button leadingIcon={<HugeiconsIcon icon={Link04Icon} strokeWidth={2} />}>
        Share
      </Button>
      <ButtonGroupSeparator />
      <Button leadingIcon={<HugeiconsIcon icon={PlayIcon} strokeWidth={2} />}>
        Present
      </Button>
    </ButtonGroup>
  );
}
