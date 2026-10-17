"use client";

import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function DrawerNested() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Account Settings
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Account Settings</DrawerTitle>
          <DrawerDescription>
            Manage your account preferences and security settings.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input id="display-name" defaultValue="Jane Cooper" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="jane@example.com" />
          </div>
        </DrawerBody>
        <DrawerFooter className="flex-row justify-between">
          <Drawer>
            <DrawerTrigger
              render={
                <Button variant="ghost" className="text-destructive">
                  Delete Account
                </Button>
              }
            />
            <DrawerContent>
              <DrawerHandle />
              <DrawerHeader>
                <DrawerTitle>Delete Account</DrawerTitle>
                <DrawerDescription>
                  This action cannot be undone. All your data will be
                  permanently removed.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-muted-foreground text-sm">
                  Please type{" "}
                  <span className="text-foreground font-medium">delete</span> to
                  confirm.
                </p>
                <Input
                  className="mt-2"
                  placeholder="Type 'delete' to confirm"
                />
              </DrawerBody>
              <DrawerFooter>
                <Button variant="destructive">Delete</Button>
                <DrawerClose render={<Button variant="outline" />}>
                  Cancel
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <div className="flex gap-2">
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
            <Button>Save</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
