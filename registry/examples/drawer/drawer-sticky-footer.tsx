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

const items = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
}));

export default function DrawerStickyFooter() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Drawer
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Sticky Footer</DrawerTitle>
          <DrawerDescription>
            The footer stays fixed at the bottom as you drag the drawer down.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="bg-muted/50 rounded-lg border p-3">
                <p className="text-sm font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </DrawerBody>
        <DrawerFooter className="sticky bottom-0">
          <DrawerClose render={<Button className="w-full" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
