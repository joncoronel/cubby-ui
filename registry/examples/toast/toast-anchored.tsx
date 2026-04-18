"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

export default function ToastAnchored() {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      disabled={open}
      onClick={() => {
        setOpen(true);
        toast.anchored({
          description: "Anchored to the button above",
          anchor: buttonRef,
          side: "top",
          sideOffset: 8,
          arrow: true,
          duration: 2000,
          onClose: () => setOpen(false),
        });
      }}
    >
      Show toast
    </Button>
  );
}
