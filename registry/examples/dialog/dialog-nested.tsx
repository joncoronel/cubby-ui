"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

export default function DialogNested() {
  return (
    <Dialog>
      <DialogTrigger
        render={(props) => (
          <Button {...props}>Open Notifications</Button>
        )}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            You are all caught up. Good job! Notice how nested dialogs scale and position properly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center pt-4">
          <Dialog>
            <DialogTrigger
              render={(props) => (
                <Button {...props} variant="outline" size="sm">
                  Customize
                </Button>
              )}
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Notifications</DialogTitle>
                <DialogDescription>
                  This dialog is nested and automatically scales smaller. The parent dialog gets a dark overlay.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-between items-center pt-4">
                <Dialog>
                  <DialogTrigger
                    render={(props) => (
                      <Button {...props} variant="ghost" size="sm">
                        Advanced Settings
                      </Button>
                    )}
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Advanced Settings</DialogTitle>
                      <DialogDescription>
                        Third level dialog - even smaller and the parent dialogs both get overlays.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end pt-4">
                      <DialogClose
                        render={(props) => (
                          <Button {...props} size="sm">Done</Button>
                        )}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <DialogClose
                  render={(props) => (
                    <Button {...props} variant="outline">Close</Button>
                  )}
                />
              </div>
            </DialogContent>
          </Dialog>
          <DialogClose
            render={(props) => (
              <Button {...props}>Close</Button>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}