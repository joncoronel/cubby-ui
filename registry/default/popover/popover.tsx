import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover({ ...props }: BasePopover.Root.Props) {
  return <BasePopover.Root data-slot="popover" {...props} />;
}

function PopoverPortal({
  ...props
}: BasePopover.Portal.Props) {
  return <BasePopover.Portal data-slot="popover-portal" {...props} />;
}

function PopoverTrigger({
  ...props
}: BasePopover.Trigger.Props) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverClose({
  ...props
}: BasePopover.Close.Props) {
  return <BasePopover.Close data-slot="popover-close" {...props} />;
}

function PopoverArrow({
  ...props
}: BasePopover.Arrow.Props) {
  return <BasePopover.Arrow data-slot="popover-arrow" {...props} />;
}

function PopoverPositioner({
  ...props
}: BasePopover.Positioner.Props) {
  return <BasePopover.Positioner data-slot="popover-positioner" {...props} />;
}

function PopoverBackdrop({
  className,
  ...props
}: BasePopover.Backdrop.Props) {
  return (
    <BasePopover.Backdrop
      data-slot="popover-backdrop"
      className={cn(
        "ease-out-cubic fixed inset-0 z-30 min-h-dvh bg-black/40 transition-all duration-200 supports-[-webkit-touch-callout:none]:absolute",
        "backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}


function PopoverTitle({
  className,
  ...props
}: BasePopover.Title.Props) {
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
      <PopoverPositioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        positionMethod={positionMethod}
        arrowPadding={arrowPadding}
        className={"z-50"}
      >
        <BasePopover.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border/60 ease-out-cubic max-h-(--available-height) w-72 max-w-(--available-width) origin-(--transform-origin) overflow-y-auto rounded-md p-4 shadow-[0_8px_20px_0_oklch(0.18_0_0/0.10)] ring-1 transition-[transform,scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {arrow && (
            <PopoverArrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
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
          {children}
        </BasePopover.Popup>
      </PopoverPositioner>
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
  PopoverBackdrop,
  createPopoverHandle,
};
