import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

export default function ButtonGroupNested() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">1</Button>
        <Button variant="outline">2</Button>
        <Button variant="outline">3</Button>
        <Button variant="outline">4</Button>
        <Button variant="outline">5</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Previous page">
          <ChevronLeftIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Next page">
          <ChevronRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
