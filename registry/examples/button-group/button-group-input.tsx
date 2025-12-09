import { SearchIcon } from "lucide-react";

import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { Input } from "@/registry/default/input/input";

export default function ButtonGroupInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button size="icon" aria-label="Search" variant="outline">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
}
