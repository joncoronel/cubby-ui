import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { Input } from "@/registry/default/input/input";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
export default function ButtonGroupInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button size="icon" aria-label="Search" variant="outline">
        <HugeiconsIcon icon={Search01Icon}  strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
