"use client";

import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/default/sheet/sheet";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";
import { SettingsIcon } from "lucide-react";

export default function SheetNested() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            leftSection={<SettingsIcon className="size-4" />}
          />
        }
      >
        Settings
      </SheetTrigger>
      <SheetContent className="max-w-xs" variant="floating" side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your account and preferences.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="johndoe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
        </SheetBody>
        <SheetFooter className="justify-between">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" className="text-destructive">
                  Delete Account
                </Button>
              }
            />
            <SheetContent className="max-w-xs" variant="floating" side="right">
              <SheetHeader>
                <SheetTitle>Delete Account</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. All your data will be
                  permanently removed.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <p className="text-muted-foreground text-sm">
                  Please type{" "}
                  <span className="text-foreground font-medium">delete</span> to
                  confirm.
                </p>
                <Input
                  className="mt-2"
                  placeholder="Type 'delete' to confirm"
                />
              </SheetBody>
              <SheetFooter>
                <SheetClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button variant="destructive">Delete</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <div className="flex gap-2">
            <SheetClose render={<Button variant="outline">Cancel</Button>} />
            <Button>Save</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
