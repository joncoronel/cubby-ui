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

export default function BaseDrawerInsetFooter() {
  return (
    <BaseDrawer>
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Inset Footer
      </BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Confirm Action</BaseDrawerTitle>
          <BaseDrawerDescription>
            The inset footer variant adds a border-top and muted background for
            visual separation.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerPanel>
          <p className="text-muted-foreground text-sm">
            This is useful when the footer contains important actions that should
            be visually distinct from the content above.
          </p>
        </BaseDrawerPanel>
        <BaseDrawerFooter variant="inset">
          <Button>Confirm</Button>
          <BaseDrawerClose render={<Button variant="outline" />}>
            Cancel
          </BaseDrawerClose>
        </BaseDrawerFooter>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
