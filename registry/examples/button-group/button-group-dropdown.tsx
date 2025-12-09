import {
  BellOffIcon,
  ChevronDownIcon,
  EyeOffIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";

export default function ButtonGroupDropdown() {
  return (
    <ButtonGroup>
      <Button leftSection={<UserPlusIcon />} variant="outline">
        Follow
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="icon" aria-label="More options" variant="outline" />
          }
        >
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <BellOffIcon />
            Mute conversation
          </DropdownMenuItem>
          <DropdownMenuItem>
            <EyeOffIcon />
            Hide conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
