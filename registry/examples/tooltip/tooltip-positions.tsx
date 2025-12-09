import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";

export default function TooltipPositions() {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Top</Button>} />
          <TooltipContent>
            <p>Top tooltip</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Right</Button>} />
          <TooltipContent side="right">
            <p>Right tooltip</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Bottom</Button>} />
          <TooltipContent side="bottom">
            <p>Bottom tooltip</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Left</Button>} />
          <TooltipContent side="left">
            <p>Left tooltip</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}