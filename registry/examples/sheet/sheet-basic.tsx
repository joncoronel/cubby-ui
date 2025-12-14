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
import { MenuIcon } from "lucide-react";

export default function SheetBasic() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon" />}>
        <MenuIcon className="size-4" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <nav className="flex flex-col gap-1">
            <a
              href="#"
              className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
            >
              Projects
            </a>
            <a
              href="#"
              className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
            >
              Team
            </a>
            <a
              href="#"
              className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
            >
              Settings
            </a>
          </nav>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
