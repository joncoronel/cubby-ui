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

export default function DrawerWithForm() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button />}>Edit Profile</DrawerTrigger>
      <DrawerContent>
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button>Save changes</Button>
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
