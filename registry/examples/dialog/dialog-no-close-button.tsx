"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
        <div className="flex justify-end pt-4">
          <DialogClose
            render={(props) => (
              <Button {...props}>Close Dialog</Button>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}