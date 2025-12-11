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

export default function DialogNested() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Account</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account preferences and security settings.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input id="display-name" defaultValue="Jane Cooper" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="jane@example.com" />
          </div>
        </DialogBody>
        <DialogFooter className="justify-between">
          <Dialog>
            <DialogTrigger
              render={<Button variant="ghost" className="text-destructive">Delete Account</Button>}
            />
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data will be
                  permanently removed.
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p className="text-muted-foreground text-sm">
                  Please type <span className="font-medium text-foreground">delete</span> to confirm.
                </p>
                <Input className="mt-2" placeholder="Type 'delete' to confirm" />
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button variant="destructive">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
