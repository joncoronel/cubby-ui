import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
export default function ButtonGroupNested() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon">1</Button>
        <Button variant="outline" size="icon">2</Button>
        <Button variant="outline" size="icon">3</Button>
        <Button variant="outline" size="icon">4</Button>
        <Button variant="outline" size="icon">5</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Previous page">
          <HugeiconsIcon icon={ArrowLeft01Icon}  strokeWidth={2} />
        </Button>
        <Button variant="outline" size="icon" aria-label="Next page">
          <HugeiconsIcon icon={ArrowRight01Icon}  strokeWidth={2} />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
