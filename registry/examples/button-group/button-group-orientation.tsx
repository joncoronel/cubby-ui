import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

export default function ButtonGroupOrientation() {
  return (
    <ButtonGroup orientation="vertical">
      <Button variant="outline" size="icon" aria-label="Increase volume">
        <PlusIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Decrease volume">
        <MinusIcon />
      </Button>
    </ButtonGroup>
  );
}
