"use client";

import * as React from "react";
import {
  BaseDrawer,
  BaseDrawerClose,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerPanel,
  BaseDrawerPopup,
  BaseDrawerTitle,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";

export default function BaseDrawerControlled() {
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
      <BaseDrawer open={open} onOpenChange={setOpen}>
        <BaseDrawerPopup showBar>
          <BaseDrawerHeader>
            <BaseDrawerTitle>Controlled Drawer</BaseDrawerTitle>
            <BaseDrawerDescription>
              This drawer is controlled via external state.
            </BaseDrawerDescription>
          </BaseDrawerHeader>
          <BaseDrawerPanel>
            <p className="text-muted-foreground text-sm">
              The open state is managed outside the component, giving you full
              control over when the drawer opens and closes.
            </p>
          </BaseDrawerPanel>
          <BaseDrawerFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
            <BaseDrawerClose render={<Button variant="outline" />}>
              Cancel
            </BaseDrawerClose>
          </BaseDrawerFooter>
        </BaseDrawerPopup>
      </BaseDrawer>
    </>
  );
}
