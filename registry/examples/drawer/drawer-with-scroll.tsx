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

const items = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  description: `This is the description for item ${i + 1}. It contains some sample text.`,
}));

export default function DrawerWithScroll() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Scrollable Drawer
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Scrollable Content</DrawerTitle>
          <DrawerDescription>
            Scroll within the drawer. Swipe down to dismiss when at the top.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col gap-3 py-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-muted/50 rounded-lg border p-3"
              >
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t p-4">
          <DrawerClose render={<Button className="w-full" />}>Done</DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
