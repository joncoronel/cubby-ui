import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  PopoverBackdrop,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers01Icon } from "@hugeicons/core-free-icons";
export default function PopoverWithBackdrop() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" leftSection={<HugeiconsIcon icon={Layers01Icon} className="size-4"  strokeWidth={2} />} />
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