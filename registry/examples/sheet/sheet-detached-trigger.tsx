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
  createSheetHandle,
} from "@/registry/default/sheet/sheet";
import { Button } from "@/registry/default/button/button";

export default function SheetDetachedTrigger() {
  const sheetHandle = createSheetHandle();

  return (
    <div className="flex gap-4">
      {/* Trigger placed OUTSIDE Sheet.Root */}
      <SheetTrigger
        handle={sheetHandle}
        render={<Button>Open Settings</Button>}
      />

      <Sheet handle={sheetHandle}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Manage your account preferences.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <p className="text-muted-foreground text-sm">
              This sheet was opened using a detached trigger placed outside the
              Sheet component.
            </p>
          </SheetBody>
          <SheetFooter>
            <SheetClose render={<Button variant="outline">Close</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
