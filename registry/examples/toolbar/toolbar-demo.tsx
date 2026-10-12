"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  MoreHorizontalIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@/registry/default/toolbar/toolbar";

export default function ToolbarDemo() {
  return (
    <Toolbar aria-label="Text formatting">
      <ToolbarToggle aria-label="Bold" defaultPressed>
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
      </ToolbarToggle>
      <ToolbarToggle aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
      </ToolbarToggle>
      <ToolbarToggle aria-label="Underline">
        <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={2} />
      </ToolbarToggle>
      <ToolbarSeparator />
      <ToolbarToggleGroup aria-label="Alignment" defaultValue={["left"]}>
        <ToolbarToggle value="left" aria-label="Align left">
          <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} />
        </ToolbarToggle>
        <ToolbarToggle value="center" aria-label="Align center">
          <HugeiconsIcon icon={TextAlignCenterIcon} strokeWidth={2} />
        </ToolbarToggle>
        <ToolbarToggle value="right" aria-label="Align right">
          <HugeiconsIcon icon={TextAlignRightIcon} strokeWidth={2} />
        </ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton aria-label="Insert link">
        <HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<ToolbarButton aria-label="More options" />}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Strikethrough</DropdownMenuItem>
          <DropdownMenuItem>Code</DropdownMenuItem>
          <DropdownMenuItem>Clear formatting</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Toolbar>
  );
}
