"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  createPopoverHandle,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { Bell } from "lucide-react";

const notificationsPopover = createPopoverHandle();

export default function PopoverDetachedTrigger() {
  return (
    <>
      <PopoverTrigger
        handle={notificationsPopover}
        render={<Button variant="outline" size="icon" />}
      >
        <Bell className="size-4" />
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>

      <Popover handle={notificationsPopover}>
        <PopoverContent>
          <PopoverTitle>Notifications</PopoverTitle>
          <PopoverDescription>
            You are all caught up. Good job!
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </>
  );
}
