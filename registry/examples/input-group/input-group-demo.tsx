import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/default/input-group/input-group";
import { Separator } from "@/registry/default/separator/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  InformationCircleIcon,
  PlusSignIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
export default function InputGroupDemo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon}  strokeWidth={2} />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="example.com" className="!pl-1" />
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Tooltip>
            <InputGroupButton
              className="rounded-full"
              size="icon_xs"
              render={(props) => <TooltipTrigger {...props} />}
            >
              <HugeiconsIcon icon={InformationCircleIcon}  strokeWidth={2} />
            </InputGroupButton>
            <TooltipContent>This is content in a tooltip.</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Ask, Search or Chat..." />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="outline"
            className="rounded-full"
            size="icon_xs"
          >
            <HugeiconsIcon icon={PlusSignIcon}  strokeWidth={2} />
          </InputGroupButton>
          <DropdownMenu>
            <InputGroupButton
              variant="ghost"
              render={(props) => <DropdownMenuTrigger {...props} />}
            >
              Auto
            </InputGroupButton>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuItem>Auto</DropdownMenuItem>
              <DropdownMenuItem>Agent</DropdownMenuItem>
              <DropdownMenuItem>Manual</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <InputGroupText className="ml-auto">52% used</InputGroupText>
          <Separator orientation="vertical" className="!h-4" />
          <InputGroupButton
            variant="neutral"
            className="rounded-full"
            size="icon_xs"
            disabled
          >
            <HugeiconsIcon icon={ArrowUp01Icon}  strokeWidth={2} />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="@shadcn" />
        <InputGroupAddon align="inline-end">
          <div className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full">
            <HugeiconsIcon icon={Tick02Icon} className="size-3"  strokeWidth={2} />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
