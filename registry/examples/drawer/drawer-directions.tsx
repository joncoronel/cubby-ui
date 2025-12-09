import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";

export default function DrawerDirections() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Drawer direction="top">
        <DrawerTrigger render={<Button variant="outline" />}>Top</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Top Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides in from the top.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </div>
          <DrawerHandle />
        </DrawerContent>
      </Drawer>

      <Drawer direction="bottom">
        <DrawerTrigger render={<Button variant="outline" />}>
          Bottom
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHandle />
          <DrawerHeader>
            <DrawerTitle>Bottom Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides in from the bottom.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer direction="left">
        <DrawerTrigger render={<Button variant="outline" />}>
          Left
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHandle />
          <DrawerHeader>
            <DrawerTitle>Left Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides in from the left.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer direction="right">
        <DrawerTrigger render={<Button variant="outline" />}>
          Right
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHandle />
          <DrawerHeader>
            <DrawerTitle>Right Drawer</DrawerTitle>
            <DrawerDescription>
              This drawer slides in from the right.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <DrawerClose
              render={<Button variant="outline" className="w-full" />}
            >
              Close
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
