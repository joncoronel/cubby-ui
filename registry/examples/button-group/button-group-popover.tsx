import { SparklesIcon } from "lucide-react";

import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";

export default function ButtonGroupPopover() {
  return (
    <ButtonGroup>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              leftSection={<SparklesIcon />}
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
              <Input id="task" placeholder="E.g., Write a blog post about..." />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input placeholder="Type a message..." />

      <Button variant="outline">Send</Button>
    </ButtonGroup>
  );
}
