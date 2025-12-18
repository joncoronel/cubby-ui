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

export default function DrawerInsetFooter() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Drawer
      </DrawerTrigger>
      <DrawerContent footerVariant="inset">
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Confirm Action</DrawerTitle>
          <DrawerDescription>
            Review the details below before confirming.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">Order Summary</p>
              <p className="text-muted-foreground text-sm">
                3 items totaling $127.99
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">Shipping Address</p>
              <p className="text-muted-foreground text-sm">
                123 Main St, City, State 12345
              </p>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button className="w-full">Confirm Order</Button>
          <DrawerClose render={<Button variant="outline" className="w-full" />}>
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
