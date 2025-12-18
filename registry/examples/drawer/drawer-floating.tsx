import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";

export default function DrawerFloating() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Drawer variant="floating" direction="top">
        <DrawerTrigger render={<Button variant="outline" />}>Top</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Floating Top</DrawerTitle>
            <DrawerDescription>
              A floating drawer from the top edge.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </DrawerBody>
          <DrawerHandle />
        </DrawerContent>
      </Drawer>

      <Drawer variant="floating" direction="bottom">
        <DrawerTrigger render={<Button variant="outline" />}>
          Bottom
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHandle />
          <DrawerHeader>
            <DrawerTitle>Floating Bottom</DrawerTitle>
            <DrawerDescription>
              A floating drawer from the bottom edge.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer variant="floating" direction="left">
        <DrawerTrigger render={<Button variant="outline" />}>Left</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Floating Left</DrawerTitle>
            <DrawerDescription>
              A floating drawer from the left edge.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer variant="floating" direction="right">
        <DrawerTrigger render={<Button variant="outline" />}>
          Right
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Floating Right</DrawerTitle>
            <DrawerDescription>
              A floating drawer from the right edge.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
