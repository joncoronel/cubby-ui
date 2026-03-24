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

export default function BaseDrawerSide() {
  return (
    <BaseDrawer position="right">
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Open Side Drawer
      </BaseDrawerTrigger>
      <BaseDrawerPopup>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Navigation</BaseDrawerTitle>
          <BaseDrawerDescription>
            Swipe right to dismiss this drawer.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerPanel>
          <nav className="flex flex-col gap-1">
            {["Dashboard", "Projects", "Settings", "Help"].map((item) => (
              <button
                key={item}
                className="hover:bg-muted rounded-md px-3 py-2 text-left text-sm font-medium transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
        </BaseDrawerPanel>
        <BaseDrawerFooter>
          <BaseDrawerClose render={<Button variant="outline" />}>
            Close
          </BaseDrawerClose>
        </BaseDrawerFooter>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
