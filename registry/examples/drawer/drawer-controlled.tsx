"use client";

import * as React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";

export default function DrawerControlled() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open Drawer
        </Button>
        <p className="text-muted-foreground text-sm">
          Drawer is {open ? "open" : "closed"}
        </p>
      </div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHandle />
          <DrawerHeader>
            <DrawerTitle>Controlled Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer is controlled via external state.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-muted-foreground text-sm">
              The open state is managed outside the component, giving you full
              control over when the drawer opens and closes.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
