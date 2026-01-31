"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  createPopoverHandle,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/registry/default/avatar/avatar";
import { Bell, Activity, User } from "lucide-react";

const animatedPopover = createPopoverHandle<React.ComponentType>();

function NotificationsPanel() {
  return (
    <div className="w-64">
      <PopoverTitle>Notifications</PopoverTitle>
      <PopoverDescription>
        You have 3 new notifications waiting for your attention.
      </PopoverDescription>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-blue-500" />
          New comment on your post
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-green-500" />
          Your export is ready
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-orange-500" />
          Weekly summary available
        </div>
      </div>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div className="w-56">
      <PopoverTitle>Activity</PopoverTitle>
      <PopoverDescription>Recent activity in your workspace.</PopoverDescription>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Documents edited</span>
          <span className="font-medium">12</span>
        </div>
        <div className="flex justify-between">
          <span>Comments added</span>
          <span className="font-medium">8</span>
        </div>
        <div className="flex justify-between">
          <span>Files shared</span>
          <span className="font-medium">3</span>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="w-56">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage
            src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
            alt="User avatar"
          />
          <AvatarFallback>JE</AvatarFallback>
        </Avatar>
        <div>
          <PopoverTitle>Jason Eventon</PopoverTitle>
          <span className="text-muted-foreground text-sm">Pro plan</span>
        </div>
      </div>
      <div className="border-border mt-3 flex flex-col gap-1 border-t pt-3">
        <a
          href="#"
          className="hover:bg-accent rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          Profile settings
        </a>
        <a
          href="#"
          className="hover:bg-accent rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          Log out
        </a>
      </div>
    </div>
  );
}

export default function PopoverAnimated() {
  return (
    <div className="flex gap-2">
      <PopoverTrigger
        handle={animatedPopover}
        payload={NotificationsPanel}
        render={<Button variant="outline" size="icon" />}
      >
        <Bell className="size-4" />
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>

      <PopoverTrigger
        handle={animatedPopover}
        payload={ActivityPanel}
        render={<Button variant="outline" size="icon" />}
      >
        <Activity className="size-4" />
        <span className="sr-only">Activity</span>
      </PopoverTrigger>

      <PopoverTrigger
        handle={animatedPopover}
        payload={ProfilePanel}
        render={<Button variant="outline" size="icon" />}
      >
        <User className="size-4" />
        <span className="sr-only">Profile</span>
      </PopoverTrigger>

      <Popover handle={animatedPopover}>
        {({ payload: Payload }) => (
          <PopoverContent arrow>
            {Payload !== undefined && <Payload />}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
