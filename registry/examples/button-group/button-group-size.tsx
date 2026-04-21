import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
export default function ButtonGroupSize() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup>
        <Button variant="outline" size="icon_sm" aria-label="Decrease">
          <HugeiconsIcon icon={MinusSignIcon} className="size-3.5"  strokeWidth={2} />
        </Button>
        <Button variant="outline" size="icon_sm" aria-label="Increase">
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5"  strokeWidth={2} />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Decrease">
          <HugeiconsIcon icon={MinusSignIcon}  strokeWidth={2} />
        </Button>
        <Button variant="outline" size="icon" aria-label="Increase">
          <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline" size="icon_lg" aria-label="Decrease">
          <HugeiconsIcon icon={MinusSignIcon} className="size-5"  strokeWidth={2} />
        </Button>
        <Button variant="outline" size="icon_lg" aria-label="Increase">
          <HugeiconsIcon icon={PlusSignIcon} className="size-5"  strokeWidth={2} />
        </Button>
      </ButtonGroup>
    </div>
  );
}
