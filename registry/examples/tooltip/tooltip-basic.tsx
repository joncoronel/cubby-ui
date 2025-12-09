import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/default/tooltip/tooltip";

export default function TooltipBasic() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}