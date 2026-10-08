"use client";

import * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";

import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

function PreviewCard<Payload = unknown>({
  ...props
}: BasePreviewCard.Root.Props<Payload>) {
  return <BasePreviewCard.Root data-slot="preview-card" {...props} />;
}

function PreviewCardTrigger<Payload = unknown>({
  // Base UI's 600ms reads as lag on a link you meant to inspect, but 0 opens a
  // card for every link the pointer sweeps across on its way somewhere else.
  // 400ms is long enough to mean "I'm resting here".
  delay = 400,
  // Long enough to cross a gap between neighbouring triggers that share a
  // handle, so the card glides to the next one instead of closing and
  // reopening. safePolygon already covers the trip into the card itself.
  closeDelay = 200,
  ...props
}: BasePreviewCard.Trigger.Props<Payload>) {
  return (
    <BasePreviewCard.Trigger
      data-slot="preview-card-trigger"
      delay={delay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

function PreviewCardPortal({ ...props }: BasePreviewCard.Portal.Props) {
  return <BasePreviewCard.Portal data-slot="preview-card-portal" {...props} />;
}

function PreviewCardPositioner({ ...props }: BasePreviewCard.Positioner.Props) {
  return (
    <BasePreviewCard.Positioner
      data-slot="preview-card-positioner"
      {...props}
    />
  );
}

function PreviewCardArrow({ ...props }: BasePreviewCard.Arrow.Props) {
  return <BasePreviewCard.Arrow data-slot="preview-card-arrow" {...props} />;
}

function PreviewCardContent({
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
  anchor,
  viewportClassName,
  arrow = false,
  arrowPadding,
  container,
  level = 3,
  shadowLevel = 3,
  ...props
}: BasePreviewCard.Popup.Props & {
  side?: BasePreviewCard.Positioner.Props["side"];
  align?: BasePreviewCard.Positioner.Props["align"];
  sideOffset?: BasePreviewCard.Positioner.Props["sideOffset"];
  alignOffset?: BasePreviewCard.Positioner.Props["alignOffset"];
  collisionBoundary?: BasePreviewCard.Positioner.Props["collisionBoundary"];
  collisionPadding?: BasePreviewCard.Positioner.Props["collisionPadding"];
  sticky?: BasePreviewCard.Positioner.Props["sticky"];
  positionMethod?: BasePreviewCard.Positioner.Props["positionMethod"];
  /** Positions against this element instead of the trigger. */
  anchor?: BasePreviewCard.Positioner.Props["anchor"];
  /** Classes for the inner viewport, e.g. to change its padding. */
  viewportClassName?: string;
  arrow?: boolean;
  arrowPadding?: number;
  container?: BasePreviewCard.Portal.Props["container"];
  /** Surface elevation level for the card bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the card reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <PreviewCardPortal container={container}>
      <BasePreviewCard.Positioner
        data-slot="preview-card-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        positionMethod={positionMethod}
        anchor={anchor}
        arrowPadding={arrowPadding}
        // Glides to the next trigger when one card serves several. The glide
        // and the size morph share one 200ms curve so the card moves as a
        // single object; split timings read as lag when the pointer sweeps
        // along a row of triggers.
        className="z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      >
        <BasePreviewCard.Popup
          data-slot="preview-card-content"
          data-level={level}
          className={cn(
            // Base styles
            "text-popover-foreground relative rounded-xl text-sm outline-none",
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "max-h-(--available-height) max-w-[min(var(--available-width),20rem)]",
            "origin-(--transform-origin)",
            // Surface elevation — bg tracks `level`, shadow weight tracks `shadowLevel`
            solidSurface(level, shadowLevel),
            // Enter: a quick rise out of a soft focus, scaled from the side
            // that faces the trigger. The 1px blur keeps the first frames
            // from reading as a hard-edged box popping in without adding
            // time. Width/height only move when the card swaps triggers.
            "transition-[width,height,scale,opacity,filter] duration-[200ms,200ms,100ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo),var(--ease-out-expo)]",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-starting-style:blur-[1px]",
            // Exit: as quick as the enter, with a plain ease-out, so leaving
            // a link never makes you wait on the card you are done with.
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:duration-100 data-ending-style:ease-out",
            // Chrome won't composite the scale while width/height transition,
            // so text re-rasters and shifts as the entrance ends. Promoting
            // the layer rasters it once.
            "will-change-transform",
            // 'focus' opens and 'dismiss' (Escape, press) closes skip the
            // animation: keyboard opens should show at once, and a deliberate
            // dismissal should not linger.
            "data-instant:transition-none",
            // Reduced motion keeps the fade, which carries no movement, and
            // drops the scale, blur, and size morph.
            "motion-reduce:transition-opacity motion-reduce:duration-150 motion-reduce:will-change-auto",
            "motion-reduce:data-ending-style:scale-100 motion-reduce:data-starting-style:scale-100 motion-reduce:data-starting-style:blur-none",
            className,
          )}
          {...props}
        >
          {arrow && (
            <PreviewCardArrow className="transition-[left,right,top,bottom] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180 motion-reduce:transition-none">
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
            </PreviewCardArrow>
          )}
          <BasePreviewCard.Viewport
            data-slot="preview-card-viewport"
            className={cn(
              // Clips here rather than on the popup so the arrow, which sits
              // outside the popup's box, is not cut off. `rounded-[inherit]`
              // keeps the clip, and a bleeding PreviewCardMedia, on the
              // card's corners.
              // `h-full` and the cap do different jobs; both are load-bearing.
              // See PopoverContent's viewport for the full reasoning.
              "relative h-full max-h-(--available-height) w-full overflow-clip rounded-[inherit] p-4 [--viewport-padding:1rem]",
              "overscroll-contain not-data-transitioning:overflow-y-auto",
              // Content width calculation (edge-to-edge minus padding)
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              // Swap between triggers, as a short carousel: the incoming
              // content slides in from 30% of the way along the direction of
              // travel while the outgoing one slides off the other side. The
              // fade runs shorter than the slide, so the two never sit on top
              // of each other as double-exposed text. Both finish inside the
              // card's 200ms glide: a switch that interrupts another restarts
              // the outgoing content from rest, so a quick sweep along a row
              // only looks clean if each swap is done before the next hop.
              "**:data-current:opacity-100 **:data-previous:opacity-100",
              "**:data-current:transition-[translate,opacity] **:data-current:duration-[200ms,100ms] **:data-current:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-previous:transition-[translate,opacity] **:data-previous:duration-[200ms,100ms] **:data-previous:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-previous:data-ending-style:opacity-0 **:data-current:data-starting-style:opacity-0",
              "data-[activation-direction~=right]:**:data-previous:data-ending-style:-translate-x-[30%] data-[activation-direction~=right]:**:data-current:data-starting-style:translate-x-[30%]",
              "data-[activation-direction~=left]:**:data-previous:data-ending-style:translate-x-[30%] data-[activation-direction~=left]:**:data-current:data-starting-style:-translate-x-[30%]",
              // A purely vertical move (a stacked list) slides vertically.
              // Base UI reports both axes, as in "right down", so this
              // excludes any horizontal token: a diagonal hop only slides
              // sideways instead of drifting on both axes at once.
              "data-[activation-direction~=down]:not-data-[activation-direction~=left]:not-data-[activation-direction~=right]:**:data-previous:data-ending-style:-translate-y-[30%] data-[activation-direction~=down]:not-data-[activation-direction~=left]:not-data-[activation-direction~=right]:**:data-current:data-starting-style:translate-y-[30%]",
              "data-[activation-direction~=up]:not-data-[activation-direction~=left]:not-data-[activation-direction~=right]:**:data-previous:data-ending-style:translate-y-[30%] data-[activation-direction~=up]:not-data-[activation-direction~=left]:not-data-[activation-direction~=right]:**:data-current:data-starting-style:-translate-y-[30%]",
              "motion-reduce:**:data-current:transition-opacity motion-reduce:**:data-previous:transition-opacity",
              viewportClassName,
            )}
          >
            {children}
          </BasePreviewCard.Viewport>
        </BasePreviewCard.Popup>
      </BasePreviewCard.Positioner>
    </PreviewCardPortal>
  );
}

/**
 * Edge-to-edge image or banner at the top of the card. Bleeds through the
 * viewport padding and picks up the card's top corners. Defaults to the 1.91:1
 * Open Graph ratio, so a link's `og:image` drops straight in.
 */
function PreviewCardMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="preview-card-media"
      className={cn(
        "bg-muted relative -mx-(--viewport-padding) -mt-(--viewport-padding) mb-3 aspect-[1.91/1] overflow-hidden",
        "*:[img,video]:size-full *:[img,video]:object-cover",
        // A hairline over the image, not around it: light images otherwise
        // dissolve into a light card. Neutral, so it reads on any photo.
        "after:pointer-events-none after:absolute after:inset-0 after:shadow-[inset_0_-1px_0_oklch(0_0_0/0.1)] dark:after:shadow-[inset_0_-1px_0_oklch(1_0_0/0.1)]",
        className,
      )}
      {...props}
    />
  );
}

function PreviewCardTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="preview-card-title"
      className={cn(
        "text-foreground text-sm leading-snug font-semibold text-balance",
        className,
      )}
      {...props}
    />
  );
}

function PreviewCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="preview-card-description"
      className={cn(
        "text-muted-foreground mt-1 text-sm leading-relaxed text-pretty",
        className,
      )}
      {...props}
    />
  );
}

const createPreviewCardHandle = BasePreviewCard.createHandle;

export {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
  PreviewCardMedia,
  PreviewCardTitle,
  PreviewCardDescription,
  PreviewCardArrow,
  PreviewCardPositioner,
  PreviewCardPortal,
  createPreviewCardHandle,
};
