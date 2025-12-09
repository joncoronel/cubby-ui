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

export default function DialogScroll() {
  return (
    <Dialog>
      <DialogTrigger
        render={(props) => (
          <Button {...props}>Long Content Dialog</Button>
        )}
      />
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Long Content Dialog</DialogTitle>
          <DialogDescription>
            This dialog contains a lot of content that will scroll when it exceeds the viewport height.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Section {i + 1}</h3>
              <p className="text-sm text-muted-foreground">
                This is some content for section {i + 1}. Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore 
                et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
                ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}