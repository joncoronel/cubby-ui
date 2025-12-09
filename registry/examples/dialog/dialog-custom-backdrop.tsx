"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

export default function DialogCustomBackdrop() {
  return (
    <Dialog>
      <DialogTrigger
        render={(props) => (
          <Button {...props}>Blur Backdrop</Button>
        )}
      />
      <DialogContent backdropClassName="backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Blur Backdrop</DialogTitle>
          <DialogDescription>
            This dialog has a custom backdrop with blur effect applied using the backdropClassName prop.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}