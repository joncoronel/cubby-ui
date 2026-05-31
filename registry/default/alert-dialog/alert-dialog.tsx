"use client";

import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
const AlertDialog = BaseAlertDialog.Root;

const createAlertDialogHandle = BaseAlertDialog.createHandle;

function AlertDialogPortal({ ...props }: BaseAlertDialog.Portal.Props) {
  return <BaseAlertDialog.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogTrigger({ ...props }: BaseAlertDialog.Trigger.Props) {
  return (
    <BaseAlertDialog.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogClose({ ...props }: BaseAlertDialog.Close.Props) {
  return <BaseAlertDialog.Close data-slot="alert-dialog-close" {...props} />;
}

function AlertDialogBackdrop({
  className,
  ...props
}: BaseAlertDialog.Backdrop.Props) {
  return (
    <BaseAlertDialog.Backdrop
      className={cn(
        "ease-out-expo fixed inset-0 min-h-dvh bg-black/40 transition-all duration-200 supports-[-webkit-touch-callout:none]:absolute",
        "backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogViewport({
  className,
  ...props
}: BaseAlertDialog.Viewport.Props) {
  return (
    <BaseAlertDialog.Viewport
      data-slot="alert-dialog-viewport"
      className={cn(
        "fixed inset-0 flex items-center justify-center overflow-hidden px-4 py-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  showCloseButton = false,
  variant = "default",
  level = 5,
  shadowLevel = 5,
  ...props
}: BaseAlertDialog.Popup.Props & {
  showCloseButton?: boolean;
  variant?: "default" | "inset";
  /** Surface elevation level for the dialog bg (1-8). Defaults to 5. Bump to 7 for a critical/destructive confirmation that needs extra gravity. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 5 by default. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop />
      <AlertDialogViewport>
        <BaseAlertDialog.Popup
          data-slot="alert-dialog-content"
          data-variant={variant}
          data-level={level}
          className={cn(
            "text-popover-foreground relative z-50 flex max-h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden",
            "rounded-2xl sm:max-w-lg",
            // Surface elevation — bg + shadow + rim overlay (rim uses ::after at z-[2])
            solidSurface(level, shadowLevel),
            // Nested dialog offset
            "-translate-y-[calc(1.25rem*var(--nested-dialogs))]",
            // Scale effect for nested dialogs
            "scale-[calc(1-0.1*var(--nested-dialogs))]",
            // Animation duration
            "ease-out-expo transition-all duration-200",
            // Animations: scale and fade
            "data-starting-style:translate-y-[calc(1.25rem)] data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:translate-y-[calc(1.25rem)] data-ending-style:scale-95 data-ending-style:opacity-0",
            // Nested dialog overlay — uses ::before (not ::after, that's the rim) at z-3 so it paints above content AND above the rim
            "before:pointer-events-none before:absolute before:inset-0 before:z-3 before:hidden before:rounded-[inherit] before:bg-black/5 before:opacity-0 before:transition-[opacity,display] before:transition-discrete before:duration-200",
            "data-nested-dialog-open:before:block data-nested-dialog-open:before:opacity-100",
            "starting:data-nested-dialog-open:before:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <AlertDialogClose
              aria-label="Close"
              className="absolute end-2 top-2"
              render={<Button size="icon_sm" variant="ghost" />}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </AlertDialogClose>
          )}
        </BaseAlertDialog.Popup>
      </AlertDialogViewport>
    </AlertDialogPortal>
  );
}

// Slot-presence checks use ancestor `:has()` queries on
// `[data-slot=alert-dialog-content]` rather than adjacent-sibling selectors,
// so consumers can wrap header/body/footer in form, ErrorBoundary, Suspense,
// or conditional fragments without breaking padding. Matches the Dialog
// primitive's approach.
function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex flex-col gap-2 px-6 pt-6 pb-3",
        // Header alone with footer (no body anywhere in content)
        "in-[[data-slot=alert-dialog-content]:not(:has([data-slot=alert-dialog-body])):has([data-slot=alert-dialog-footer])]:pb-6",
        // Header alone (no body, no footer)
        "in-[[data-slot=alert-dialog-content]:not(:has([data-slot=alert-dialog-body])):not(:has([data-slot=alert-dialog-footer]))]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogBody({
  className,
  nativeScroll = false,
  fadeEdges = true,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  nativeScroll?: boolean;
} & Pick<
    ScrollAreaProps,
    "fadeEdges" | "scrollbarGutter" | "persistScrollbar" | "hideScrollbar"
  >) {
  return (
    <div
      data-slot="alert-dialog-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        // No header anywhere in content → body needs its own top padding
        "in-[[data-slot=alert-dialog-content]:not(:has([data-slot=alert-dialog-header]))]:pt-5",
        // No footer anywhere in content → body needs its own bottom padding
        "in-[[data-slot=alert-dialog-content]:not(:has([data-slot=alert-dialog-footer]))]:pb-5",
        // Inset variant: still need bottom padding when a footer follows so the
        // body's content doesn't crowd the footer's top border
        "in-data-[variant=inset]:in-[[data-slot=alert-dialog-content]:has([data-slot=alert-dialog-footer])]:pb-5",
      )}
    >
      <ScrollArea
        className="flex-1"
        fadeEdges={fadeEdges}
        scrollbarGutter={scrollbarGutter}
        persistScrollbar={persistScrollbar}
        hideScrollbar={hideScrollbar}
        nativeScroll={nativeScroll}
      >
        <div className={cn("px-6 py-1", className)} {...props}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 px-6 pt-4 pb-6 sm:flex-row sm:justify-end",
        // No header AND no body → footer alone, needs its own top padding
        "in-[[data-slot=alert-dialog-content]:not(:has([data-slot=alert-dialog-header])):not(:has([data-slot=alert-dialog-body]))]:pt-6",
        // Reduce top padding when body is present
        "not-in-data-[variant=inset]:in-[[data-slot=alert-dialog-content]:has([data-slot=alert-dialog-body])]:pt-3",
        // Inset variant: muted background with top border for separation
        "in-data-[variant=inset]:border-border in-data-[variant=inset]:bg-muted in-data-[variant=inset]:rounded-b-2xl in-data-[variant=inset]:border-t in-data-[variant=inset]:pt-4 in-data-[variant=inset]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: BaseAlertDialog.Title.Props) {
  return (
    <BaseAlertDialog.Title
      className={cn(
        "text-foreground text-lg leading-none font-semibold tracking-tight text-balance",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: BaseAlertDialog.Description.Props) {
  return (
    <BaseAlertDialog.Description
      className={cn("text-muted-foreground text-sm text-pretty", className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  createAlertDialogHandle,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogViewport,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
};
