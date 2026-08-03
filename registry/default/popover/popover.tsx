import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

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

function PopoverPopup({
  className,
  level = 3,
  shadowLevel = 3,
  ...props
}: BasePopover.Popup.Props & {
  level?: SurfaceLevel;
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <BasePopover.Popup
      data-slot="popover-popup"
      data-level={level}
      className={cn(
        "text-popover-foreground relative max-h-(--available-height) max-w-(--available-width) origin-(--transform-origin) rounded-xl outline-none",
        solidSurface(level, shadowLevel),
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
        "ease-out-expo fixed inset-0 z-30 min-h-dvh bg-black/40 transition-all duration-150 supports-[-webkit-touch-callout:none]:absolute",
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
  level = 3,
  shadowLevel = 3,
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
  /** Surface elevation level for the popup bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the popover reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
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
        className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none"
      >
        <BasePopover.Popup
          data-slot="popover-content"
          data-level={level}
          className={cn(
            // Base styles
            "text-popover-foreground relative outline-none",
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "max-h-(--available-height) max-w-(--available-width)",
            "origin-(--transform-origin) overflow-hidden rounded-xl",
            // Surface elevation — bg tracks `level`, shadow weight tracks `shadowLevel`
            solidSurface(level, shadowLevel),
            // Size/opacity transitions
            "transition-[width,height,scale,opacity] duration-[150ms,150ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            // Suppress only the "already open, something changed" instants,
            // never the open/close ones. Base UI waits on this transition
            // before unmounting, so killing it on a close ('dismiss', or
            // 'focus' from focus-out) means no exit animation at all. And
            // 'click' is inferred from `event.detail === 0`, which is equally
            // true of right-clicks and programmatic .click().
            "data-[instant=trigger-change]:transition-none",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {arrow && (
            <PopoverArrow className="transition-[left,right,top,bottom] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180 motion-reduce:transition-none">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path
                  d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V9H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
                  className="fill-(--popup-surface,var(--popover))"
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
              // Height is bounded here rather than inherited from the popup.
              // `h-full` would be `height: 100%` against a parent whose
              // specified height is `--popup-height` — the literal `auto` at
              // rest — so the percentage stays indefinite and the viewport
              // grows to its content instead. scrollHeight then always equals
              // clientHeight and the overflow-y below can never engage. Capping
              // the viewport itself gives it a definite bound while leaving the
              // popup's height free to animate for the morph.
              "relative max-h-(--available-height) w-full overflow-clip px-3 py-3 [--viewport-padding:0.75rem]",
              "not-data-transitioning:overflow-y-auto",
              // Content width calculation (edge-to-edge minus padding)
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              // Non-directional crossfade, mirroring TransitionPanel's `fade`
              // mode: the two halves dissolve in place rather than sliding past
              // each other, so nothing implies travel and the popup's own
              // width/height morph carries the movement on its own.
              "**:data-current:scale-100 **:data-current:opacity-100",
              "**:data-previous:scale-100 **:data-previous:opacity-100",
              "**:data-current:transition-[scale,opacity] **:data-current:duration-150 **:data-current:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-previous:transition-[scale,opacity] **:data-previous:duration-150 **:data-previous:ease-[cubic-bezier(0.22,1,0.36,1)]",
              // Both directions recede to 0.96, so the swap reads the same
              // whichever trigger you came from.
              "**:data-current:data-starting-style:scale-[0.96] **:data-current:data-starting-style:opacity-0",
              "**:data-previous:data-ending-style:scale-[0.96] **:data-previous:data-ending-style:opacity-0",
              // Value-matched to the popup's own guard above, so one policy governs
              // the whole subtree. Targets the content, not the viewport: the
              // viewport has no transitions of its own and transition-property does
              // not inherit, so a rule here would be a no-op.
              "[[data-instant=trigger-change]_&_[data-current]]:transition-none [[data-instant=trigger-change]_&_[data-previous]]:transition-none",
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
