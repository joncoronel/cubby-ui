import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  PopoverBackdrop,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { Layers } from "lucide-react";

export default function PopoverWithBackdrop() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" leftSection={<Layers className="size-4" />} />
        }
      >
        Open Modal Popover
      </PopoverTrigger>
      <PopoverBackdrop />
      <PopoverContent className="w-80">
        <PopoverTitle>Modal Popover</PopoverTitle>
        <PopoverDescription>
          This popover has a backdrop overlay that dims the background content.
          The backdrop prevents interaction with elements behind the popover,
          creating a modal-like experience. Click outside to close.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}