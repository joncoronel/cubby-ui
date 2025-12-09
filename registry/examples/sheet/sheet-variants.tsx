"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/default/sheet/sheet";
import { Button } from "@/registry/default/button/button";

export default function SheetVariants() {
  return (
    <div className="flex gap-4">
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Default Sheet
        </SheetTrigger>
        <SheetContent variant="default">
          <SheetHeader>
            <SheetTitle>Default Sheet</SheetTitle>
            <SheetDescription>
              This is the default sheet variant. It slides in from the edge
              without floating margins or rounded corners.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Floating Sheet
        </SheetTrigger>
        <SheetContent variant="floating">
          <SheetHeader>
            <SheetTitle>Floating Sheet</SheetTitle>
            <SheetDescription>
              This is the floating sheet variant with rounded corners,
              margins from screen edges, and a subtle shadow.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}