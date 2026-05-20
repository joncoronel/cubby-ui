import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";

import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
export default function ButtonGroupPopover() {
  return (
    <ButtonGroup>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              leftSection={<HugeiconsIcon icon={SparklesIcon}  strokeWidth={2} />}
              aria-label="Open Copilot assistant"
            />
          }
        >
          Copilot
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Task Description</h4>
              <p className="text-muted-foreground text-sm">
                Describe what you would like the AI to help you with.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task">Task</Label>
              <Input id="task" variant="elevated" placeholder="E.g., Write a blog post about..." />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input placeholder="Type a message..." />

      <Button variant="outline">Send</Button>
    </ButtonGroup>
  );
}
