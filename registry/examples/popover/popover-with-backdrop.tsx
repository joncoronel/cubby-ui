import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverBackdrop,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { Layers } from "lucide-react";

export default function PopoverWithBackdrop() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <Layers className="mr-2 h-4 w-4" />
        Open Modal Popover
      </PopoverTrigger>
      <PopoverBackdrop />
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium leading-none">Modal Popover</h4>
            <p className="text-sm text-muted-foreground mt-2">
              This popover has a backdrop overlay that dims the background content.
              Click outside to close.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              The backdrop prevents interaction with elements behind the popover,
              creating a modal-like experience.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}