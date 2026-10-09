import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive02Icon,
  Copy01Icon,
  Delete02Icon,
  PinIcon,
} from "@hugeicons/core-free-icons";

const VARIANTS = ["outline", "soft", "elevated", "solid"] as const;

export default function ButtonGroupVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {VARIANTS.map((variant) => (
        <ButtonGroup key={variant} variant={variant} aria-label="Note actions">
          <Button size="icon" aria-label="Duplicate">
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
          </Button>
          <Button size="icon" aria-label="Pin">
            <HugeiconsIcon icon={PinIcon} strokeWidth={2} />
          </Button>
          <Button size="icon" aria-label="Archive">
            <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
          </Button>
          <ButtonGroupSeparator />
          <Button size="icon" aria-label="Delete">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
