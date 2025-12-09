import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { Plus } from "lucide-react";

export default function TooltipWithButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>} />
        <TooltipContent>
          <p>Add new item</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}