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
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

export default function DialogControlled() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Discard Draft
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes that will be lost if you leave this page.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-muted-foreground text-sm">
              Your draft has been auto-saved. You can restore it later from the
              drafts folder.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
