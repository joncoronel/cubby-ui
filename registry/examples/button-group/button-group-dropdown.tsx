import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronDownIcon,
  Clock01Icon,
  FloppyDiskIcon,
  GlobeIcon,
} from "@hugeicons/core-free-icons";

export default function ButtonGroupDropdown() {
  return (
    <ButtonGroup variant="solid" aria-label="Publish">
      <Button leadingIcon={<HugeiconsIcon icon={GlobeIcon} strokeWidth={2} />}>
        Publish
      </Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="icon" aria-label="More publish options" />}
        >
          <HugeiconsIcon icon={ChevronDownIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
            Schedule
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />
            Save as draft
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
