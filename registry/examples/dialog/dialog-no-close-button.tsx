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

export default function DialogNoCloseButton() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">View Cookie Settings</Button>} />
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            We use cookies to improve your experience and analyze site traffic.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Essential Cookies</p>
              <p className="text-muted-foreground text-xs">Required for the site to function</p>
            </div>
            <span className="text-muted-foreground text-xs">Always on</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Analytics Cookies</p>
              <p className="text-muted-foreground text-xs">Help us improve our site</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Marketing Cookies</p>
              <p className="text-muted-foreground text-xs">Personalized advertisements</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Reject All</Button>} />
          <DialogClose render={<Button>Accept All</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}