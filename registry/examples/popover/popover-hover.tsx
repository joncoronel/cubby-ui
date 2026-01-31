import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { Bell } from "lucide-react";

export default function PopoverHover() {
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        render={<Button variant="outline" size="icon" />}
      >
        <Bell className="size-4" />
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
