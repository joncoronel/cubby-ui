"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  Copy01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Button } from "@/registry/default/button/button";

export default function DropdownMenuWithInset() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* No icon of their own, so `inset` lines their labels up with the
            icon items above instead of hanging out to the left. */}
        <DropdownMenuItem inset>Rename</DropdownMenuItem>
        <DropdownMenuItem inset>Move to folder</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
