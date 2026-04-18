import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="icon" />}>
        <HugeiconsIcon icon={Notification03Icon} className="size-4"  strokeWidth={2} />
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Notifications</PopoverTitle>
        <PopoverDescription>
          You are all caught up. Good job!
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}
