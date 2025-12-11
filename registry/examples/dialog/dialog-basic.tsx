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

export default function DialogBasic() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Share</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this project.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-center gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="https://cubby.dev/p/abc123"
              readOnly
            />
            <Button type="submit">Copy</Button>
          </div>
        </DialogBody>
        <DialogFooter className="sm:justify-start">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
