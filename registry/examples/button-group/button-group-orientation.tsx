import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
export default function ButtonGroupOrientation() {
  return (
    <ButtonGroup orientation="vertical">
      <Button variant="outline" size="icon" aria-label="Increase volume">
        <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
      </Button>
      <Button variant="outline" size="icon" aria-label="Decrease volume">
        <HugeiconsIcon icon={MinusSignIcon}  strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
