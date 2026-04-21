import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BubbleChatIcon,
  Mail01Icon,
  PlusSignCircleIcon,
  PlusSignIcon,
  UserAdd01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
export default function DropdownMenuWithSubMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        More Options
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <HugeiconsIcon icon={UserMultipleIcon} className="mr-2 h-4 w-4"  strokeWidth={2} />
            <span>Team</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <HugeiconsIcon icon={UserAdd01Icon} className="mr-2 h-4 w-4"  strokeWidth={2} />
              <span>Invite users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Mail01Icon} className="mr-2 h-4 w-4"  strokeWidth={2} />
                <span>Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={BubbleChatIcon} className="mr-2 h-4 w-4"  strokeWidth={2} />
                <span>Message</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HugeiconsIcon icon={PlusSignCircleIcon} className="mr-2 h-4 w-4"  strokeWidth={2} />
                <span>More...</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4"  strokeWidth={2} />
            <span>New Team</span>
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
