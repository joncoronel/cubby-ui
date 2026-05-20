"use client";

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
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function DialogNonModal() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Open the dialog, then try clicking or typing below. The page stays
        interactive and outside clicks don&apos;t close the dialog.
      </p>

      <div className="flex items-center gap-2">
        <Dialog modal={false}>
          <DialogTrigger render={<Button variant="outline" />}>
            Open Floating Panel
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Quick Note</DialogTitle>
              <DialogDescription>
                This dialog is non-modal — interact with the page behind it.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Label htmlFor="note" className="sr-only">
                Note
              </Label>
              <Input id="note" variant="elevated" placeholder="Type a note..." />
            </DialogBody>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Done</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Input placeholder="Type here while the dialog is open" />
      </div>
    </div>
  );
}
