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

export default function BaseDrawerFloating() {
  return (
    <div className="flex flex-wrap gap-4">
      <BaseDrawer>
        <BaseDrawerTrigger render={<Button variant="outline" />}>
          Bottom Floating
        </BaseDrawerTrigger>
        <BaseDrawerPopup variant="floating" showBar>
          <BaseDrawerHeader>
            <BaseDrawerTitle>Floating Drawer</BaseDrawerTitle>
            <BaseDrawerDescription>
              On desktop, this drawer has inset spacing and fully rounded
              corners.
            </BaseDrawerDescription>
          </BaseDrawerHeader>
          <BaseDrawerFooter>
            <BaseDrawerClose render={<Button variant="outline" />}>
              Close
            </BaseDrawerClose>
          </BaseDrawerFooter>
        </BaseDrawerPopup>
      </BaseDrawer>

      <BaseDrawer position="right">
        <BaseDrawerTrigger render={<Button variant="outline" />}>
          Right Floating
        </BaseDrawerTrigger>
        <BaseDrawerPopup variant="floating" >
          <BaseDrawerHeader>
            <BaseDrawerTitle>Floating Side Drawer</BaseDrawerTitle>
            <BaseDrawerDescription>
              The floating variant works with all positions.
            </BaseDrawerDescription>
          </BaseDrawerHeader>
          <BaseDrawerFooter>
            <BaseDrawerClose render={<Button variant="outline" />}>
              Close
            </BaseDrawerClose>
          </BaseDrawerFooter>
        </BaseDrawerPopup>
      </BaseDrawer>
    </div>
  );
}
