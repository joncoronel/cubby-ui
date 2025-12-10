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

export default function DialogScroll() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Long Content Dialog</Button>} />
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Long Content Dialog</DialogTitle>
          <DialogDescription>
            This dialog contains a lot of content that will scroll when it
            exceeds the viewport height.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">Section {i + 1}</h3>
              <p className="text-muted-foreground text-sm">
                This is some content for section {i + 1}. Lorem ipsum dolor sit
                amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button>Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
