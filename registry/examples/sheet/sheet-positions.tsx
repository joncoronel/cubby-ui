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

export default function SheetPositions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Top</SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className="text-muted-foreground text-sm">
              You have 3 unread messages.
            </p>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Right</SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Cart</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className="text-muted-foreground text-sm">Your cart is empty.</p>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Bottom</SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Share</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Copy link
              </Button>
              <Button variant="outline" size="sm">
                Email
              </Button>
              <Button variant="outline" size="sm">
                Message
              </Button>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Left</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <nav className="flex flex-col gap-1">
              <a href="#" className="hover:bg-muted rounded-md px-3 py-2 text-sm">
                Home
              </a>
              <a href="#" className="hover:bg-muted rounded-md px-3 py-2 text-sm">
                About
              </a>
              <a href="#" className="hover:bg-muted rounded-md px-3 py-2 text-sm">
                Contact
              </a>
            </nav>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
