import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
  ...props
}: React.ComponentProps<typeof BaseTooltip.Provider>) {
  return <BaseTooltip.Provider data-slot="tooltip-provider" {...props} />;
}

function Tooltip<Payload = unknown>({
  ...props
}: BaseTooltip.Root.Props<Payload>) {
  return <BaseTooltip.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof BaseTooltip.Trigger>) {
  return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipPortal({
  ...props
}: React.ComponentProps<typeof BaseTooltip.Portal>) {
  return <BaseTooltip.Portal data-slot="tooltip-portal" {...props} />;
}

function TooltipPositioner({
  ...props
}: React.ComponentProps<typeof BaseTooltip.Positioner>) {
  return <BaseTooltip.Positioner data-slot="tooltip-positioner" {...props} />;
}

function TooltipArrow({
  ...props
}: React.ComponentProps<typeof BaseTooltip.Arrow>) {
  return <BaseTooltip.Arrow data-slot="tooltip-arrow" {...props} />;
}

function TooltipContent({
  children,
  className,
  side = "top",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  collisionBoundary,
  collisionPadding = 10,
  sticky = false,
  positionMethod = "absolute",
  arrow = false,
  arrowPadding,
  container,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Popup> & {
  side?: BaseTooltip.Positioner.Props["side"];
  align?: BaseTooltip.Positioner.Props["align"];
  sideOffset?: BaseTooltip.Positioner.Props["sideOffset"];
  alignOffset?: BaseTooltip.Positioner.Props["alignOffset"];
  collisionBoundary?: BaseTooltip.Positioner.Props["collisionBoundary"];
  collisionPadding?: BaseTooltip.Positioner.Props["collisionPadding"];
  sticky?: BaseTooltip.Positioner.Props["sticky"];
  positionMethod?: BaseTooltip.Positioner.Props["positionMethod"];
  arrow?: boolean;
  arrowPadding?: number;
  container?: HTMLElement | undefined;
}) {
  return (
    <TooltipPortal container={container}>
      <BaseTooltip.Positioner
        data-slot="tooltip-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        positionMethod={positionMethod}
        arrowPadding={arrowPadding}
        className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-card ring-border/60 h-(--popup-height,auto) w-(--popup-width,auto) origin-(--transform-origin) rounded-sm text-xs shadow-[0_3px_8px_0_oklch(0.18_0_0/0.12)] ring-1",
            "transition-[width,height,scale,opacity] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-starting-style:scale-90 data-starting-style:opacity-0",
            "data-ending-style:scale-90 data-ending-style:opacity-0",
            "data-instant:duration-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          <BaseTooltip.Viewport
            data-slot="tooltip-viewport"
            className={cn(
              // Base viewport styles
              "relative size-full overflow-clip px-2 py-1.5 [--viewport-padding:0.5rem]",
              "not-data-transitioning:overflow-y-auto",
              // Content width calculation (edge-to-edge minus padding)
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              // Content base state and transitions
              "**:data-current:translate-x-0 **:data-current:opacity-100",
              "**:data-previous:translate-x-0 **:data-previous:opacity-100",
              "**:data-current:transition-[translate,opacity,filter] **:data-current:duration-[350ms,175ms,175ms]",
              "**:data-previous:transition-[translate,opacity,filter] **:data-previous:duration-[350ms,175ms,175ms]",
              "**:data-current:ease-[cubic-bezier(0.22,1,0.36,1)] **:data-previous:ease-[cubic-bezier(0.22,1,0.36,1)]",
              // Direction-aware slide animations for incoming content
              "data-[activation-direction~=left]:**:data-current:data-starting-style:-translate-x-1/2",
              "data-[activation-direction~=left]:**:data-current:data-starting-style:opacity-0",
              "data-[activation-direction~=right]:**:data-current:data-starting-style:translate-x-1/2",
              "data-[activation-direction~=right]:**:data-current:data-starting-style:opacity-0",
              // Direction-aware slide animations for outgoing content
              "data-[activation-direction~=left]:**:data-previous:data-ending-style:translate-x-1/2",
              "data-[activation-direction~=left]:**:data-previous:data-ending-style:opacity-0",
              "data-[activation-direction~=right]:**:data-previous:data-ending-style:-translate-x-1/2",
              "data-[activation-direction~=right]:**:data-previous:data-ending-style:opacity-0",

              // Blur effect during transitions
              "**:data-current:data-starting-style:blur-[4px]",
              "**:data-current:data-ending-style:blur-[4px]",
              "**:data-previous:data-starting-style:blur-[4px]",
              "**:data-previous:data-ending-style:blur-[4px]",

              // Disable transitions when instant or motion-reduce
              "data-instant:transition-none",
              "motion-reduce:**:data-current:transition-none motion-reduce:**:data-previous:transition-none",
            )}
          >
            {children}
          </BaseTooltip.Viewport>
          {arrow && (
            <TooltipArrow className="outline-0 transition-[left,right,top,bottom] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:top-[-9px] data-[side=left]:right-[-13.5px] data-[side=left]:rotate-90 data-[side=right]:left-[-13.5px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-9px] data-[side=top]:rotate-180">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path
                  d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V9H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
                  className="fill-card"
                />
                <path
                  d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
                  className="fill-border/80 dark:fill-border/60"
                />
              </svg>
            </TooltipArrow>
          )}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </TooltipPortal>
  );
}

const createTooltipHandle = BaseTooltip.createHandle;

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
  TooltipPositioner,
  TooltipArrow,
  TooltipProvider,
  createTooltipHandle,
};
