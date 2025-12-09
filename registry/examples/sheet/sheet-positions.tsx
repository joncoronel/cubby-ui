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

export default function SheetPositions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Top
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Sheet from Top</SheetTitle>
            <SheetDescription>
              This sheet slides in from the top of the screen.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Right
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Sheet from Right</SheetTitle>
            <SheetDescription>
              This sheet slides in from the right side of the screen.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Bottom
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Sheet from Bottom</SheetTitle>
            <SheetDescription>
              This sheet slides in from the bottom of the screen.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Left
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Sheet from Left</SheetTitle>
            <SheetDescription>
              This sheet slides in from the left side of the screen.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}