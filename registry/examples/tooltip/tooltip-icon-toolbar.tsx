import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { Bold, Italic, Underline } from "lucide-react";

export default function TooltipIconToolbar() {
  return (
    <TooltipProvider>
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon">
              <Bold className="h-4 w-4" />
            </Button>} />
          <TooltipContent>
            <p>Bold</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon">
              <Italic className="h-4 w-4" />
            </Button>} />
          <TooltipContent>
            <p>Italic</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon">
              <Underline className="h-4 w-4" />
            </Button>} />
          <TooltipContent>
            <p>Underline</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}