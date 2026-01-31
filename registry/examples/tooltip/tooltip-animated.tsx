"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  createTooltipHandle,
} from "@/registry/default/tooltip/tooltip";
import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { FileText, ImageIcon, Video } from "lucide-react";

interface TooltipPayload {
  title: string;
  description: string;
}

const animatedTooltip = createTooltipHandle<TooltipPayload>();

export default function TooltipAnimated() {
  return (
    <TooltipProvider>
      <ButtonGroup>
        <TooltipTrigger
          handle={animatedTooltip}
          payload={{ title: "Documents", description: "View your documents" }}
          render={<Button variant="outline" size="icon" />}
        >
          <FileText className="size-4" />
          <span className="sr-only">Documents</span>
        </TooltipTrigger>

        <TooltipTrigger
          handle={animatedTooltip}
          payload={{ title: "Images", description: "Browse your images" }}
          render={<Button variant="outline" size="icon" />}
        >
          <ImageIcon className="size-4" />
          <span className="sr-only">Images</span>
        </TooltipTrigger>

        <TooltipTrigger
          handle={animatedTooltip}
          payload={{ title: "Videos", description: "Watch your videos" }}
          render={<Button variant="outline" size="icon" />}
        >
          <Video className="size-4" />
          <span className="sr-only">Videos</span>
        </TooltipTrigger>
      </ButtonGroup>
      <Tooltip handle={animatedTooltip}>
        {({ payload }) => (
          <TooltipContent arrow={false}>
            {payload && (
              <div className="text-center">
                <p className="font-medium">{payload.title}</p>
                <p className="text-muted-foreground text-xs">
                  {payload.description}
                </p>
              </div>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
