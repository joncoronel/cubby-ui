"use client";

import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/default/sheet/sheet";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function SheetNonModal() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Open the sheet, then try clicking or typing below. The page stays
        interactive and outside clicks don&apos;t close the sheet.
      </p>

      <div className="flex items-center gap-2">
        <Sheet modal={false}>
          <SheetTrigger render={<Button variant="outline" />}>
            Open Side Panel
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                This sheet is non-modal — interact with the page behind it.
              </SheetDescription>
            </SheetHeader>
            <SheetBody>
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <Input id="search" placeholder="Search filters..." />
            </SheetBody>
            <SheetFooter>
              <SheetClose render={<Button variant="outline">Done</Button>} />
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Input placeholder="Type here while the sheet is open" />
      </div>
    </div>
  );
}
