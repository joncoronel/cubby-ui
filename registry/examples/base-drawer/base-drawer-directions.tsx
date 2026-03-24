import {
  BaseDrawer,
  BaseDrawerClose,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerPopup,
  BaseDrawerTitle,
  BaseDrawerTrigger,
  type DrawerPosition,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";

const directions: { position: DrawerPosition; label: string }[] = [
  { position: "top", label: "Top" },
  { position: "bottom", label: "Bottom" },
  { position: "left", label: "Left" },
  { position: "right", label: "Right" },
];

export default function BaseDrawerDirections() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {directions.map(({ position, label }) => (
        <BaseDrawer key={position} position={position}>
          <BaseDrawerTrigger render={<Button variant="outline" />}>
            {label}
          </BaseDrawerTrigger>
          <BaseDrawerPopup showBar={position === "top" || position === "bottom"}>
            <BaseDrawerHeader>
              <BaseDrawerTitle>{label} Drawer</BaseDrawerTitle>
              <BaseDrawerDescription>
                This drawer slides in from the {label.toLowerCase()}. Swipe to
                dismiss.
              </BaseDrawerDescription>
            </BaseDrawerHeader>
            <BaseDrawerFooter>
              <BaseDrawerClose render={<Button variant="outline" />}>
                Close
              </BaseDrawerClose>
            </BaseDrawerFooter>
          </BaseDrawerPopup>
        </BaseDrawer>
      ))}
    </div>
  );
}
