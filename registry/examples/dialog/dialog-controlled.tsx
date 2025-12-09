"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

export default function DialogControlled() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={(props) => <Button {...props}>Open Dialog</Button>}
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>
              This dialog's open state is controlled by React state. Current
              state: {open ? "open" : "closed"}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
