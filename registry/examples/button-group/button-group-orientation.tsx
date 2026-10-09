import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  FullScreenIcon,
  LockIcon,
  SearchAddIcon,
  SearchMinusIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

export default function ButtonGroupOrientation() {
  return (
    <ButtonGroup
      orientation="vertical"
      variant="soft"
      aria-label="Canvas controls"
      className="[--radius:9999px]"
    >
      <Button size="icon" aria-label="Zoom in">
        <HugeiconsIcon icon={SearchAddIcon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Zoom out">
        <HugeiconsIcon icon={SearchMinusIcon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Fit to screen" disabled>
        <HugeiconsIcon icon={FullScreenIcon} strokeWidth={2} />
      </Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="Lock canvas">
        <HugeiconsIcon icon={LockIcon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Hide layer">
        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
