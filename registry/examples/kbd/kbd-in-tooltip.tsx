import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Scissor01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";

export default function KbdInTooltip() {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon" />}>
            <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
            <span className="sr-only">Copy</span>
          </TooltipTrigger>
          <TooltipContent>
            <span className="flex items-center gap-2">
              Copy
              <Kbd size="sm" keys={["mod", "c"]} />
            </span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon" />}>
            <HugeiconsIcon icon={Scissor01Icon} size={16} strokeWidth={2} />
            <span className="sr-only">Cut</span>
          </TooltipTrigger>
          <TooltipContent variant="inverse">
            <span className="flex items-center gap-2">
              Cut
              <Kbd size="sm" keys={["mod", "x"]} />
            </span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
