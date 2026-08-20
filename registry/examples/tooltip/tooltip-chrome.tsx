import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";

export default function TooltipChrome() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon" />}>
          <HugeiconsIcon icon={Notification01Icon} size={16} strokeWidth={2} />
          <span className="sr-only">Notifications</span>
        </TooltipTrigger>
        <TooltipContent variant="chrome">
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
