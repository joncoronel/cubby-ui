"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  createTooltipHandle,
} from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
} from "@hugeicons/core-free-icons";

interface TooltipPayload {
  label: string;
  shortcut: string;
}

const alignmentTooltip = createTooltipHandle<TooltipPayload>();

export default function TooltipAnimated() {
  return (
    <TooltipProvider>
      <ButtonGroup>
        <TooltipTrigger
          handle={alignmentTooltip}
          payload={{ label: "Align left", shortcut: "⌘⇧L" }}
          render={<Button variant="outline" size="icon" />}
        >
          <HugeiconsIcon icon={TextAlignLeftIcon} size={16} strokeWidth={2} />
          <span className="sr-only">Align left</span>
        </TooltipTrigger>

        <TooltipTrigger
          handle={alignmentTooltip}
          payload={{ label: "Align center", shortcut: "⌘⇧E" }}
          render={<Button variant="outline" size="icon" />}
        >
          <HugeiconsIcon icon={TextAlignCenterIcon} size={16} strokeWidth={2} />
          <span className="sr-only">Align center</span>
        </TooltipTrigger>

        <TooltipTrigger
          handle={alignmentTooltip}
          payload={{ label: "Align right", shortcut: "⌘⇧R" }}
          render={<Button variant="outline" size="icon" />}
        >
          <HugeiconsIcon icon={TextAlignRightIcon} size={16} strokeWidth={2} />
          <span className="sr-only">Align right</span>
        </TooltipTrigger>
      </ButtonGroup>
      <Tooltip handle={alignmentTooltip}>
        {({ payload }) => (
          <TooltipContent arrow={false}>
            {payload && (
              <div className="flex items-center gap-2">
                <span>{payload.label}</span>
                <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                  {payload.shortcut}
                </kbd>
              </div>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
