"use client";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/default/sheet/sheet";
import { Button } from "@/registry/default/button/button";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";

export default function SheetVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              leftSection={<ChevronUpIcon className="size-4" />}
            />
          }
        >
          Top
        </SheetTrigger>
        <SheetContent variant="floating" side="top">
          <SheetHeader>
            <SheetTitle>Top Sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the top of the screen.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className="text-muted-foreground text-sm">
              Top sheets are useful for notifications, alerts, or quick actions
              that don&apos;t require much vertical space.
            </p>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              leftSection={<ChevronRightIcon className="size-4" />}
            />
          }
        >
          Right
        </SheetTrigger>
        <SheetContent variant="floating" side="right">
          <SheetHeader>
            <SheetTitle>Right Sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the right side of the screen.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className="text-muted-foreground text-sm">
              Right sheets are the most common pattern, ideal for navigation
              menus, settings panels, or detailed views.
            </p>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              leftSection={<ChevronDownIcon className="size-4" />}
            />
          }
        >
          Bottom
        </SheetTrigger>
        <SheetContent variant="floating" side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom Sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the bottom of the screen.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className="text-muted-foreground text-sm">
              Bottom sheets are popular on mobile devices for action menus,
              share dialogs, or additional options.
            </p>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              leftSection={<ChevronLeftIcon className="size-4" />}
            />
          }
        >
          Left
        </SheetTrigger>
        <SheetContent variant="floating" side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
            <SheetDescription>
              This sheet slides in from the left side of the screen.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className="text-muted-foreground text-sm">
              Left sheets are commonly used for primary navigation, sidebars, or
              app drawers.
            </p>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
