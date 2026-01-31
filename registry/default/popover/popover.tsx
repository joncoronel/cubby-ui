import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover<Payload = unknown>({
  ...props
}: BasePopover.Root.Props<Payload>) {
  return <BasePopover.Root data-slot="popover" {...props} />;
}

function PopoverPortal({ ...props }: BasePopover.Portal.Props) {
  return <BasePopover.Portal data-slot="popover-portal" {...props} />;
}

function PopoverTrigger({ ...props }: BasePopover.Trigger.Props) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose({ ...props }: BasePopover.Close.Props) {
  return <BasePopover.Close data-slot="popover-close" {...props} />;
}

function PopoverArrow({ ...props }: BasePopover.Arrow.Props) {
  return <BasePopover.Arrow data-slot="popover-arrow" {...props} />;
}

function PopoverPositioner({ ...props }: BasePopover.Positioner.Props) {
  return <BasePopover.Positioner data-slot="popover-positioner" {...props} />;
}

function PopoverViewport({ className, ...props }: BasePopover.Viewport.Props) {
  return (
    <BasePopover.Viewport
      data-slot="popover-viewport"
      className={cn("relative h-full w-full overflow-clip", className)}
      {...props}
    />
  );
}

function PopoverPopup({ className, ...props }: BasePopover.Popup.Props) {
  return (
    <BasePopover.Popup
      data-slot="popover-popup"
      className={cn(
        "bg-popover text-popover-foreground ring-border/60 max-h-(--available-height) max-w-(--available-width) origin-(--transform-origin) rounded-md shadow-[0_8px_20px_0_oklch(0.18_0_0/0.10)] ring-1",
        className,
      )}
      {...props}
    />
  );
}

function PopoverBackdrop({ className, ...props }: BasePopover.Backdrop.Props) {
  return (
    <BasePopover.Backdrop
      data-slot="popover-backdrop"
      className={cn(
        "ease-out-cubic fixed inset-0 z-30 min-h-dvh bg-black/40 transition-all duration-150 supports-[-webkit-touch-callout:none]:absolute",
        "backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: BasePopover.Title.Props) {
  return (
    <BasePopover.Title
      data-slot="popover-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: BasePopover.Description.Props) {
  return (
    <BasePopover.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function PopoverContent({
  children,
  className,
  side = "bottom",
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
}: BasePopover.Popup.Props & {
  side?: BasePopover.Positioner.Props["side"];
  align?: BasePopover.Positioner.Props["align"];
  sideOffset?: BasePopover.Positioner.Props["sideOffset"];
  alignOffset?: BasePopover.Positioner.Props["alignOffset"];
  collisionBoundary?: BasePopover.Positioner.Props["collisionBoundary"];
  collisionPadding?: BasePopover.Positioner.Props["collisionPadding"];
  sticky?: BasePopover.Positioner.Props["sticky"];
  positionMethod?: BasePopover.Positioner.Props["positionMethod"];
  arrow?: boolean;
  arrowPadding?: number;
  container?: HTMLElement | undefined;
}) {
  return (
    <PopoverPortal container={container}>
      <BasePopover.Positioner
        data-slot="popover-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        positionMethod={positionMethod}
        arrowPadding={arrowPadding}
        className="ease-out-cubic z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-150 data-instant:transition-none"
      >
        <BasePopover.Popup
          data-slot="popover-content"
          className={cn(
            // Base styles
            "bg-popover text-popover-foreground ring-border/60 relative",
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "max-h-(--available-height) max-w-(--available-width)",
            "origin-(--transform-origin) overflow-hidden rounded-md shadow-[0_8px_20px_0_oklch(0.18_0_0/0.10)] ring-1",
            // Size/opacity transitions
            "ease-out-cubic transition-[width,height,scale,opacity] duration-150",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {arrow && (
            <PopoverArrow className="ease-out-cubic transition-[left,right,top,bottom] duration-150 data-instant:transition-none data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path
                  d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V9H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
                  className="fill-popover"
                />
                <path
                  d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
                  className="fill-border/70"
                />
              </svg>
            </PopoverArrow>
          )}
          <BasePopover.Viewport
            data-slot="popover-viewport"
            className={cn(
              // Base viewport styles
              "relative size-full overflow-clip px-4 py-4 [--viewport-padding:1rem]",
              "not-data-transitioning:overflow-y-auto",
              // Content width calculation (edge-to-edge minus padding)
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              // Content base state and transitions
              "**:data-current:translate-x-0 **:data-current:opacity-100",
              "**:data-previous:translate-x-0 **:data-previous:opacity-100",
              "**:data-current:ease-out-cubic **:data-current:transition-[translate,opacity,filter] **:data-current:duration-200 **:data-previous:ease-out-cubic **:data-previous:transition-[translate,opacity,filter] **:data-previous:duration-200",
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
              "**:data-current:data-starting-style:blur-[4px]",
              "**:data-current:data-ending-style:blur-[4px]",
              "**:data-previous:data-starting-style:blur-[4px]",
              "**:data-previous:data-ending-style:blur-[4px]",
              "data-instant:transition-none",
              "motion-reduce:**:data-current:transition-none motion-reduce:**:data-previous:transition-none",
            )}
          >
            {children}
          </BasePopover.Viewport>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </PopoverPortal>
  );
}

const createPopoverHandle = BasePopover.createHandle;

export {
  Popover,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
  PopoverPositioner,
  PopoverPortal,
  PopoverPopup,
  PopoverBackdrop,
  PopoverViewport,
  createPopoverHandle,
};
