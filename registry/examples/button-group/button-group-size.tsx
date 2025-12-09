import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

export default function ButtonGroupSize() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup>
        <Button variant="outline" size="icon_sm" aria-label="Decrease">
          <MinusIcon className="size-3.5" />
        </Button>
        <Button variant="outline" size="icon_sm" aria-label="Increase">
          <PlusIcon className="size-3.5" />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Decrease">
          <MinusIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Increase">
          <PlusIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline" size="icon_lg" aria-label="Decrease">
          <MinusIcon className="size-5" />
        </Button>
        <Button variant="outline" size="icon_lg" aria-label="Increase">
          <PlusIcon className="size-5" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
