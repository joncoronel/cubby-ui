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
  // Base UI's 600ms feels laggy; 0 opens a card for every link the pointer crosses.
  delay = 400,
  // Long enough to reach a neighbouring trigger on the same handle, so the card
  // glides to it instead of closing.
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
  /** Classes for the inner viewport. Set padding with `[--viewport-padding:…]`. */
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
        // Glides between triggers on the size morph's 200ms curve, so the card
        // moves as one object.
        className="z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none"
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
            // Surface elevation
            solidSurface(level, shadowLevel),
            // Enter: scale and a 1px blur from the trigger side. Width and
            // height only transition when the card switches triggers.
            "transition-[width,height,scale,opacity,filter] duration-[200ms,200ms,100ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo),var(--ease-out-expo)]",
            "data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-starting-style:blur-[1px]",
            // Exit
            "data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:duration-100 data-ending-style:ease-out",
            // Chrome re-rasters text while width/height transition, which
            // shifts it as the entrance ends. A promoted layer rasters once.
            "will-change-transform",
            // Keyboard opens and Escape/press closes skip the animation
            "data-instant:transition-none",
            // Reduced motion: fade only
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
              // Clips here, not on the popup, so the arrow isn't cut off.
              // `h-full` and the max-h cap are both needed; see PopoverContent.
              "relative h-full max-h-(--available-height) w-full overflow-clip rounded-[inherit] p-(--viewport-padding) [--viewport-padding:1rem]",
              "overscroll-contain not-data-transitioning:overflow-y-auto",
              // Content width (edge to edge minus padding)
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              // Trigger switch: crossfade with an 8px nudge from the direction
              // of travel. A switch that interrupts another restarts the old
              // content from rest; the 2px blur merges the two into one card.
              "**:data-current:opacity-100 **:data-previous:opacity-100",
              "**:data-current:transition-[translate,opacity,filter] **:data-current:duration-150 **:data-current:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-previous:transition-[translate,opacity,filter] **:data-previous:duration-150 **:data-previous:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-current:data-starting-style:opacity-0 **:data-current:data-starting-style:blur-[2px]",
              "**:data-previous:data-ending-style:opacity-0 **:data-previous:data-ending-style:blur-[2px]",
              "data-[activation-direction~=right]:**:data-current:data-starting-style:translate-x-2",
              "data-[activation-direction~=left]:**:data-current:data-starting-style:-translate-x-2",
              // Vertical nudge only on a purely vertical move. Base UI reports
              // diagonals as "right down", which nudge sideways.
              "data-[activation-direction~=down]:not-data-[activation-direction~=left]:not-data-[activation-direction~=right]:**:data-current:data-starting-style:translate-y-2",
              "data-[activation-direction~=up]:not-data-[activation-direction~=left]:not-data-[activation-direction~=right]:**:data-current:data-starting-style:-translate-y-2",
              // Reduced motion: plain crossfade
              "motion-reduce:**:data-current:transition-opacity motion-reduce:**:data-previous:transition-opacity",
              "motion-reduce:**:data-previous:data-ending-style:blur-none motion-reduce:**:data-current:data-starting-style:blur-none",
              // Keyboard opens skip the swap, like the popup
              "data-instant:**:data-current:transition-none data-instant:**:data-previous:transition-none",
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

/** Edge-to-edge image at the top of the card, in the 1.91:1 Open Graph ratio. */
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
        // Bottom hairline, so light images don't dissolve into the card
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
  createPreviewCardHandle,
};
