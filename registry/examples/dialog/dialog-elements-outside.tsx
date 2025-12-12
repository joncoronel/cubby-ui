"use client";

import { XIcon } from "lucide-react";
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

export default function DialogElementsOutside() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>View Image</Button>} />

      <DialogContent
        className="group/popup pointer-events-none static flex h-full max-h-full w-full items-center justify-center overflow-visible bg-transparent shadow-none ring-0 data-ending-style:translate-y-0 data-ending-style:scale-100 data-starting-style:translate-y-0 data-starting-style:scale-100 sm:max-w-full"
        showCloseButton={false}
      >
        {/* Close button positioned OUTSIDE the card visually */}
        <DialogClose className="text-foreground/70 hover:text-foreground focus-visible:outline-ring/50 pointer-events-auto absolute top-0 right-2 mb-2 flex h-8 w-8 items-center justify-center self-end rounded-full outline-0 transition-colors focus-visible:outline-2">
          <XIcon className="h-8 w-8" />
          <span className="sr-only">Close</span>
        </DialogClose>
        {/* The actual popup card */}
        <div className="bg-popover text-popover-foreground ring-border ease-out-cubic pointer-events-auto w-full max-w-full rounded-2xl shadow-lg ring-1 transition-transform duration-200 group-data-ending-style/popup:translate-y-[calc(1.25rem)] group-data-ending-style/popup:scale-95 group-data-starting-style/popup:translate-y-[calc(1.25rem)] group-data-starting-style/popup:scale-95 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>
              The close button appears outside the card but remains in the tab
              order.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
              <span className="text-muted-foreground text-sm">
                Image placeholder
              </span>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Done</Button>} />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
