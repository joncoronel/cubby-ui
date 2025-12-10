"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

export default function DialogNoCloseButton() {
  return (
    <Dialog>
      <DialogTrigger
        render={(props) => (
          <Button {...props} variant="outline">Open Dialog</Button>
        )}
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>No Close Button</DialogTitle>
          <DialogDescription>
            This dialog doesn't have the default close button. You must use the button below or press Escape to close.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button>Close Dialog</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}