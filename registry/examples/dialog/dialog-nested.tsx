"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

export default function DialogNested() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Open Notifications</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            You are all caught up. Good job! Notice how nested dialogs scale and
            position properly.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-between">
          <Dialog>
            <DialogTrigger
              render={<Button variant="outline">Customize</Button>}
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Notifications</DialogTitle>
                <DialogDescription>
                  This dialog is nested and automatically scales smaller. The
                  parent dialog gets a dark overlay.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="justify-between">
                <Dialog>
                  <DialogTrigger
                    render={<Button variant="ghost">Advanced Settings</Button>}
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Advanced Settings</DialogTitle>
                      <DialogDescription>
                        Third level dialog - even smaller and the parent dialogs
                        both get overlays.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose render={<Button size="sm">Done</Button>} />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <DialogClose
                  render={<Button variant="outline">Close</Button>}
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DialogClose render={<Button>Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
