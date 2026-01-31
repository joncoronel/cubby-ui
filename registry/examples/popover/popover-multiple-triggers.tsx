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
import { Bell, Mail, MessageSquare } from "lucide-react";

const sharedPopover = createPopoverHandle<{ title: string; message: string }>();

export default function PopoverMultipleTriggers() {
  return (
    <div className="flex gap-2">
      <PopoverTrigger
        handle={sharedPopover}
        payload={{ title: "Notifications", message: "You have 3 new notifications." }}
        render={<Button variant="outline" size="icon" />}
      >
        <Bell className="size-4" />
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>

      <PopoverTrigger
        handle={sharedPopover}
        payload={{ title: "Messages", message: "You have 5 unread messages." }}
        render={<Button variant="outline" size="icon" />}
      >
        <Mail className="size-4" />
        <span className="sr-only">Messages</span>
      </PopoverTrigger>

      <PopoverTrigger
        handle={sharedPopover}
        payload={{ title: "Comments", message: "Someone replied to your comment." }}
        render={<Button variant="outline" size="icon" />}
      >
        <MessageSquare className="size-4" />
        <span className="sr-only">Comments</span>
      </PopoverTrigger>

      <Popover handle={sharedPopover}>
        {({ payload }) => (
          <PopoverContent>
            <PopoverTitle>{payload?.title ?? "Info"}</PopoverTitle>
            <PopoverDescription>
              {payload?.message ?? "No information available."}
            </PopoverDescription>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
