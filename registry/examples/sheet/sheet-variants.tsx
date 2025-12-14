"use client";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/default/sheet/sheet";
import { Button } from "@/registry/default/button/button";
import { BellIcon } from "lucide-react";

export default function SheetVariants() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon" />}>
        <BellIcon className="size-4" />
      </SheetTrigger>
      <SheetContent variant="floating" side="right">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-3">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium">New comment</p>
            <p className="text-muted-foreground text-xs">
              Sarah replied to your post
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium">Upload complete</p>
            <p className="text-muted-foreground text-xs">
              Your file has been uploaded
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium">Welcome!</p>
            <p className="text-muted-foreground text-xs">
              Thanks for signing up
            </p>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
