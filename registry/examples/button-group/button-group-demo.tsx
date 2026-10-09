import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive02Icon,
  ChevronDownIcon,
  Copy01Icon,
  Delete02Icon,
  Edit02Icon,
  Link04Icon,
  PinIcon,
} from "@hugeicons/core-free-icons";

export default function ButtonGroupDemo() {
  return (
    <ButtonGroup aria-label="File actions" className="[--radius:9999px]">
      <Button leadingIcon={<HugeiconsIcon icon={Link04Icon} strokeWidth={2} />}>
        Share
      </Button>
      <ButtonGroupSeparator />
      <Button leadingIcon={<HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />}>
        Duplicate
      </Button>
      <ButtonGroupSeparator />
      <Button
        leadingIcon={<HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />}
      >
        Archive
      </Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="icon" aria-label="More actions" />}
        >
          <HugeiconsIcon icon={ChevronDownIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem>
            <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HugeiconsIcon icon={PinIcon} strokeWidth={2} />
            Pin to top
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
