"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
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

const controlledPopover = createPopoverHandle();

export default function PopoverControlled() {
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>(null);

  const handleOpenChange = (
    isOpen: boolean,
    eventDetails: BasePopover.Root.ChangeEventDetails,
  ) => {
    setOpen(isOpen);
    setTriggerId(eventDetails.trigger?.id ?? null);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <PopoverTrigger
        id="trigger-1"
        handle={controlledPopover}
        render={<Button variant="outline" size="icon" />}
      >
        <Bell className="size-4" />
        <span className="sr-only">Trigger 1</span>
      </PopoverTrigger>

      <PopoverTrigger
        id="trigger-2"
        handle={controlledPopover}
        render={<Button variant="outline" size="icon" />}
      >
        <Bell className="size-4" />
        <span className="sr-only">Trigger 2</span>
      </PopoverTrigger>

      <PopoverTrigger
        id="trigger-3"
        handle={controlledPopover}
        render={<Button variant="outline" size="icon" />}
      >
        <Bell className="size-4" />
        <span className="sr-only">Trigger 3</span>
      </PopoverTrigger>

      <Button
        variant="outline"
        onClick={() => {
          setTriggerId("trigger-2");
          setOpen(true);
        }}
      >
        Open programmatically
      </Button>

      <Popover
        handle={controlledPopover}
        open={open}
        onOpenChange={handleOpenChange}
        triggerId={triggerId}
      >
        <PopoverContent>
          <PopoverTitle>Notifications</PopoverTitle>
          <PopoverDescription>
            You are all caught up. Good job!
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  );
}
