"use client";

import * as React from "react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  createDialogHandle,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

export default function DialogDetachedTrigger() {
  const dialogHandle = createDialogHandle();

  return (
    <div className="flex gap-4">
      {/* Trigger placed OUTSIDE Dialog.Root */}
      <DialogTrigger
        handle={dialogHandle}
        render={<Button>Open Settings</Button>}
      />

      <Dialog handle={dialogHandle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account preferences.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-muted-foreground text-sm">
              This dialog was opened using a detached trigger placed outside the
              Dialog component.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Close</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
