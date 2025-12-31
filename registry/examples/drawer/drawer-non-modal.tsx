import {
  Drawer,
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

export default function DrawerNonModal() {
  return (
    <div className="flex flex-wrap gap-2">
      <Drawer modal={false}>
        <DrawerTrigger render={<Button variant="outline" />}>
          Non-Modal
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHandle />
          <DrawerHeader>
            <DrawerTitle>Non-Modal Drawer</DrawerTitle>
            <DrawerDescription>
              No focus trapping. Interact with the page while open.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button className="w-full" />}>
              Done
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer modal="trap-focus">
        <DrawerTrigger render={<Button variant="outline" />}>
          Trap Focus
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHandle />
          <DrawerHeader>
            <DrawerTitle>Trap Focus Drawer</DrawerTitle>
            <DrawerDescription>
              Focus is trapped, but the page remains interactive.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button className="w-full" />}>
              Done
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
