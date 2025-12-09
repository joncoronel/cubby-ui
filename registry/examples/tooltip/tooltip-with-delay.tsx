import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";

export default function TooltipWithDelay() {
  return (
    <div className="flex gap-4">
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">No delay</Button>} />
          <TooltipContent>
            <p>Instant tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider delay={1000}>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">1s delay</Button>} />
          <TooltipContent>
            <p>Delayed tooltip</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}