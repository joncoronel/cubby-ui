"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArchiveIcon,
  ArrowLeft01Icon,
  CalendarAdd01Icon,
  Clock01Icon,
  Delete02Icon,
  FilterIcon,
  MailValidation01Icon,
  MoreHorizontalIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
export default function ButtonGroupDemo() {
  const [label, setLabel] = React.useState("personal");

  return (
    <ButtonGroup>
      <ButtonGroup className="hidden sm:flex">
        <Button variant="outline" size="icon" aria-label="Go Back">
          <HugeiconsIcon icon={ArrowLeft01Icon}  strokeWidth={2} />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" aria-label="More Options">
                <HugeiconsIcon icon={MoreHorizontalIcon}  strokeWidth={2} />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HugeiconsIcon icon={MailValidation01Icon}  strokeWidth={2} />
                Mark as Read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={ArchiveIcon}  strokeWidth={2} />
                Archive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Clock01Icon}  strokeWidth={2} />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={CalendarAdd01Icon}  strokeWidth={2} />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={FilterIcon}  strokeWidth={2} />
                Add to List
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={Tag01Icon}  strokeWidth={2} />
                  Label As...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={label}
                    onValueChange={setLabel}
                  >
                    <DropdownMenuRadioItem value="personal">
                      Personal
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="work">
                      Work
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="other">
                      Other
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <HugeiconsIcon icon={Delete02Icon}  strokeWidth={2} />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  );
}
