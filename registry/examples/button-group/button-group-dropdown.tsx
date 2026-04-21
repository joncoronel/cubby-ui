import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  NotificationOff03Icon,
  UserAdd01Icon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
export default function ButtonGroupDropdown() {
  return (
    <ButtonGroup>
      <Button leftSection={<HugeiconsIcon icon={UserAdd01Icon}  strokeWidth={2} />} variant="outline">
        Follow
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="icon" aria-label="More options" variant="outline" />
          }
        >
          <HugeiconsIcon icon={ArrowDown01Icon}  strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <HugeiconsIcon icon={NotificationOff03Icon}  strokeWidth={2} />
            Mute conversation
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HugeiconsIcon icon={ViewOffIcon}  strokeWidth={2} />
            Hide conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
