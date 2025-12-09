import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { Info } from "lucide-react";

export default function PopoverWithoutArrow() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <Info className="mr-2 h-4 w-4" />
        Info
      </PopoverTrigger>
      <PopoverContent arrow={false}>
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Information</p>
            <p className="text-sm text-muted-foreground">
              This popover doesn't have an arrow pointer.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
