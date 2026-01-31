import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { Plus } from "lucide-react";

export default function TooltipBasic() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon" />}>
        <Plus className="size-4" />
        <span className="sr-only">Add to library</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  );
}