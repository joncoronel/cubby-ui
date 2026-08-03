import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

function TooltipProvider({
  // Base UI's own default is 600ms, which reads as sluggish for a label that
  // mostly confirms what an icon already implies. Set here rather than on
  // TooltipTrigger because the trigger's `delay` *wins* over the provider's
  // (`delay ?? providerDelay ?? 600`), so a default there would make
  // `<TooltipProvider delay>` impossible to honour.
  delay = 200,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Provider>) {
  return (
    <BaseTooltip.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  );
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
  level = 2,
  shadowLevel = 2,
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
  /** Surface elevation level for the tooltip bg (1-8). Defaults to 2 — the lightest "lifted off the page" tier. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 2 by default so tooltips read as quiet/subtle. */
  shadowLevel?: SurfaceLevel;
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
        className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none"
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          data-level={level}
          className={cn(
            // `relative` matches Popover and pins the arrow's containing block.
            // Without it the popup is a containing block only while `scale` is
            // mid-animation (a non-none scale creates one) and not at rest, so
            // an absolutely positioned arrow would change reference frame
            // partway through the open.
            "text-popover-foreground relative h-(--popup-height,auto) w-(--popup-width,auto) origin-(--transform-origin) rounded-sm text-xs outline-none",
            solidSurface(level, shadowLevel),
            // No directional translate: the popup scales from
            // --transform-origin, which Base UI aims back at the trigger, so
            // the growth already reads as coming from the anchor. A per-side
            // nudge on top of that is a second cue for the same thing.
            "transition-[width,height,scale,opacity] duration-[150ms,150ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo)]",
            // Own compositor layer while mounted. Without it the 0.95 -> 1
            // scale re-lays-out and re-rasterises the label every frame, and at
            // 12px the hinting snaps stems between pixels, which reads as the
            // text crawling. Promoted, the glyphs raster once and the layer is
            // scaled instead. Scoped to the popup, which only exists while the
            // tooltip is shown, so nothing carries the hint at rest.
            "will-change-transform",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            // Suppress only the "already open, something changed" instants.
            // 'delay' is a swap inside a Provider group (or a sibling opening).
            // 'dismiss' and 'focus' are closes and opens: Base UI waits on this
            // transition before unmounting, so killing it there means no exit
            // animation at all.
            "data-[instant=delay]:transition-none",
            "motion-reduce:transition-none motion-reduce:will-change-auto",
            className,
          )}
          {...props}
        >
          <BaseTooltip.Viewport
            data-slot="tooltip-viewport"
            className={cn(
              // Base viewport styles
              // Bounded here rather than inherited from the popup: `h-full`
              // is `height: 100%` against a parent whose specified height is
              // `--popup-height`, the literal `auto` at rest, so the
              // percentage stays indefinite and the viewport grows to its
              // content. scrollHeight then always equals clientHeight and the
              // overflow-y below can never engage. Capping the viewport gives
              // it a definite bound and leaves the popup's height free to
              // animate for the morph.
              "relative max-h-(--available-height) w-full overflow-clip px-2 py-1.5 [--viewport-padding:0.5rem]",
              "not-data-transitioning:overflow-y-auto",
              // Content width and transitions
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              // Straight crossfade, no scale: tooltip content is a line of
              // text, and scaling it fights the popup's own scale rather than
              // reading as a separate layer. The width/height morph carries
              // the swap.
              "**:data-current:opacity-100 **:data-previous:opacity-100",
              "**:data-current:transition-opacity **:data-current:duration-150 **:data-current:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-previous:transition-opacity **:data-previous:duration-150 **:data-previous:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-current:data-starting-style:opacity-0",
              "**:data-previous:data-ending-style:opacity-0",
              // Truncate outgoing content as popup shrinks.
              "**:data-previous:truncate",
              // Disable transitions when instant or motion-reduce
              // Value-matched to the popup's own guard above, so one policy governs
              // the whole subtree. Targets the content, not the viewport: the
              // viewport has no transitions of its own and transition-property does
              // not inherit, so a rule here would be a no-op.
              "[[data-instant=delay]_&_[data-current]]:transition-none [[data-instant=delay]_&_[data-previous]]:transition-none",
              "motion-reduce:**:data-current:transition-none motion-reduce:**:data-previous:transition-none",
            )}
          >
            {children}
          </BaseTooltip.Viewport>
          {arrow && (
            <TooltipArrow className="outline-0 transition-[left,right,top,bottom] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:top-[-9px] data-[side=left]:right-[-13.5px] data-[side=left]:rotate-90 data-[side=right]:left-[-13.5px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-9px] data-[side=top]:rotate-180 motion-reduce:transition-none">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path
                  d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V9H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
                  className="fill-(--popup-surface,var(--card))"
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
