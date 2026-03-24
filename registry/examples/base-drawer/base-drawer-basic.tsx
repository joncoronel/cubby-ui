import {
  BaseDrawer,
  BaseDrawerClose,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerPopup,
  BaseDrawerTitle,
  BaseDrawerTrigger,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";

export default function BaseDrawerBasic() {
  return (
    <BaseDrawer>
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Open Drawer
      </BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Notifications</BaseDrawerTitle>
          <BaseDrawerDescription>
            You are all caught up. Good job!
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerFooter>
          <BaseDrawerClose render={<Button variant="outline" />}>
            Close
          </BaseDrawerClose>
        </BaseDrawerFooter>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
