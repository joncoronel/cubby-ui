import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export default function TooltipBasic() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon" />}>
        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
        <span className="sr-only">Add to library</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  );
}