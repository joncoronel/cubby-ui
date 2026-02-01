"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  createTooltipHandle,
} from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

const infoTooltip = createTooltipHandle();

export default function TooltipDetachedTrigger() {
  return (
    <>
      <TooltipTrigger
        handle={infoTooltip}
        render={<Button variant="outline" size="icon" />}
      >
        <HugeiconsIcon icon={InformationCircleIcon} size={16} strokeWidth={2} />
        <span className="sr-only">More information</span>
      </TooltipTrigger>

      <Tooltip handle={infoTooltip}>
        <TooltipContent>
          <p>This tooltip is connected via a handle</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
