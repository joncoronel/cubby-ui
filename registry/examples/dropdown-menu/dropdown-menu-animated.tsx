"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroupLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  createDropdownMenuHandle,
} from "@/registry/default/dropdown-menu/dropdown-menu";

import { HugeiconsIcon } from "@hugeicons/react";
import { File02Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
type MenuContent = {
  heading: string;
  items: string[][];
};

const MENUS = {
  file: {
    heading: "File",
    items: [
      ["New document", "Open recent"],
      ["Save", "Save as...", "Export"],
    ],
  },
  account: {
    heading: "Account",
    items: [
      ["Profile", "Settings"],
      ["Billing", "Subscription"],
    ],
  },
  preferences: {
    heading: "Preferences",
    items: [
      ["Appearance", "Language"],
      ["Notifications", "Privacy"],
    ],
  },
} as const satisfies Record<string, MenuContent>;

type MenuKey = keyof typeof MENUS;

const menuHandle = createDropdownMenuHandle<MenuKey>();

export default function DropdownMenuAnimated() {
  return (
    <div className="flex gap-2">
      <DropdownMenuTrigger
        handle={menuHandle}
        payload={"file" as const}
        render={<Button variant="outline" size="icon" />}
      >
        <HugeiconsIcon icon={File02Icon} className="size-4"  strokeWidth={2} />
        <span className="sr-only">File</span>
      </DropdownMenuTrigger>

      <DropdownMenuTrigger
        handle={menuHandle}
        payload={"account" as const}
        render={<Button variant="outline" size="icon" />}
      >
        <HugeiconsIcon icon={UserIcon} className="size-4"  strokeWidth={2} />
        <span className="sr-only">Account</span>
      </DropdownMenuTrigger>

      <DropdownMenuTrigger
        handle={menuHandle}
        payload={"preferences" as const}
        render={<Button variant="outline" size="icon" />}
      >
        <HugeiconsIcon icon={Settings01Icon} className="size-4"  strokeWidth={2} />
        <span className="sr-only">Preferences</span>
      </DropdownMenuTrigger>

      <DropdownMenu handle={menuHandle} modal={false}>
        {({ payload }) => (
          <DropdownMenuContent align="start">
            {payload &&
              MENUS[payload].items.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  <DropdownMenuGroup>
                    {groupIndex === 0 && (
                      <DropdownMenuGroupLabel>
                        {MENUS[payload].heading}
                      </DropdownMenuGroupLabel>
                    )}
                    {group.map((item) => (
                      <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  {groupIndex < MENUS[payload].items.length - 1 && (
                    <DropdownMenuSeparator />
                  )}
                </React.Fragment>
              ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
