"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  createTooltipHandle,
} from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { HelpCircle } from "lucide-react";

const controlledTooltip = createTooltipHandle();

export default function TooltipControlled() {
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>(null);

  const handleOpenChange = (
    isOpen: boolean,
    eventDetails: BaseTooltip.Root.ChangeEventDetails,
  ) => {
    setOpen(isOpen);
    setTriggerId(eventDetails.trigger?.id ?? null);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-4">
        <ButtonGroup>
          <TooltipTrigger
            id="help-1"
            handle={controlledTooltip}
            render={<Button variant="outline" size="icon" />}
          >
            <HelpCircle className="size-4" />
            <span className="sr-only">Help 1</span>
          </TooltipTrigger>

          <TooltipTrigger
            id="help-2"
            handle={controlledTooltip}
            render={<Button variant="outline" size="icon" />}
          >
            <HelpCircle className="size-4" />
            <span className="sr-only">Help 2</span>
          </TooltipTrigger>

          <TooltipTrigger
            id="help-3"
            handle={controlledTooltip}
            render={<Button variant="outline" size="icon" />}
          >
            <HelpCircle className="size-4" />
            <span className="sr-only">Help 3</span>
          </TooltipTrigger>
        </ButtonGroup>

        <Button
          variant="outline"
          onClick={() => {
            setTriggerId("help-2");
            setOpen(true);
          }}
        >
          Open programmatically
        </Button>

        <Tooltip
          handle={controlledTooltip}
          open={open}
          onOpenChange={handleOpenChange}
          triggerId={triggerId}
        >
          <TooltipContent>
            <p>Controlled tooltip</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
