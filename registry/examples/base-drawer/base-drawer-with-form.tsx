import {
  BaseDrawer,
  BaseDrawerClose,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerPanel,
  BaseDrawerPopup,
  BaseDrawerTitle,
  BaseDrawerTrigger,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function BaseDrawerWithForm() {
  return (
    <BaseDrawer>
      <BaseDrawerTrigger render={<Button />}>Edit Profile</BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Edit profile</BaseDrawerTitle>
          <BaseDrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerPanel>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bd-name">Name</Label>
              <Input id="bd-name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bd-username">Username</Label>
              <Input id="bd-username" defaultValue="@peduarte" />
            </div>
          </div>
        </BaseDrawerPanel>
        <BaseDrawerFooter>
          <Button>Save changes</Button>
          <BaseDrawerClose render={<Button variant="outline" />}>
            Cancel
          </BaseDrawerClose>
        </BaseDrawerFooter>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
