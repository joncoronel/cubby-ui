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

export default function DialogBasic() {
  return (
    <Dialog>
      <DialogTrigger
        render={(props) => (
          <Button {...props}>Open Dialog</Button>
        )}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title and description. It includes a close button in the top right.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}