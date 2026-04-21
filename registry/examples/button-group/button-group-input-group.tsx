"use client";

import * as React from "react";

import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";

import { HugeiconsIcon } from "@hugeicons/react";
import { AudioWave02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
export default function ButtonGroupInputGroup() {
  const [voiceEnabled, setVoiceEnabled] = React.useState(false);

  return (
    <ButtonGroup className="[--radius:9999rem]">
      <ButtonGroup>
        <Button variant="outline" size="icon">
          <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroupInput
            placeholder={
              voiceEnabled ? "Record and send audio..." : "Send a message..."
            }
            disabled={voiceEnabled}
          />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger
                render={
                  <InputGroupButton
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    size="icon_xs"
                    data-active={voiceEnabled}
                    className="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
                    aria-pressed={voiceEnabled}
                  >
                    <HugeiconsIcon icon={AudioWave02Icon}  strokeWidth={2} />
                  </InputGroupButton>
                }
              />
              <TooltipContent>Voice Mode</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  );
}
