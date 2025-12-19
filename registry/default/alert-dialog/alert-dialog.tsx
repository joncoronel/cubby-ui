"use client";

import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

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
        "ease-out-cubic fixed inset-0 min-h-dvh bg-black/40 transition-all duration-200 supports-[-webkit-touch-callout:none]:absolute",
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
  ...props
}: BaseAlertDialog.Popup.Props & {
  showCloseButton?: boolean;
  variant?: "default" | "inset";
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop />
      <AlertDialogViewport>
        <BaseAlertDialog.Popup
          data-variant={variant}
          className={cn(
            "bg-popover text-popover-foreground relative z-50 flex max-h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden shadow-lg",
            "ring-border rounded-2xl ring-1 sm:max-w-lg",
            // Nested dialog offset
            "-translate-y-[calc(1.25rem*var(--nested-dialogs))]",
            // Scale effect for nested dialogs
            "scale-[calc(1-0.1*var(--nested-dialogs))]",
            // Animation duration
            "ease-out-cubic transition-all duration-200",
            // Animations: scale and fade
            "data-starting-style:translate-y-[calc(1.25rem)] data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:translate-y-[calc(1.25rem)] data-ending-style:scale-95 data-ending-style:opacity-0",
            // Nested dialog overlay (hidden by default, fades in/out using allow-discrete)
            "after:pointer-events-none after:absolute after:inset-0 after:hidden after:rounded-[inherit] after:bg-black/5 after:opacity-0 after:transition-[opacity,display] after:duration-200 after:transition-discrete",
            "data-nested-dialog-open:after:block data-nested-dialog-open:after:opacity-100",
            "starting:data-nested-dialog-open:after:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <AlertDialogClose className="focus-visible:outline-ring/50 absolute top-4 right-4 rounded-sm opacity-70 outline-0 outline-offset-0 outline-transparent transition-opacity outline-solid hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none">
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </AlertDialogClose>
          )}
        </BaseAlertDialog.Popup>
      </AlertDialogViewport>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex flex-col space-y-1.5 px-6 pt-6 pb-4",
        // Reduce bottom padding when header is directly before footer (no body) to maintain p-5 total gap
        "not-has-[+[data-slot=alert-dialog-body]]:has-[+[data-slot=alert-dialog-footer]]:pb-1",
        // Add extra bottom padding when header is alone (no body or footer)
        "not-has-[+[data-slot=alert-dialog-body]]:not-has-[+[data-slot=alert-dialog-footer]]:pb-6",
        // Inset variant: add extra bottom padding when header is directly before footer (no body)
        "in-data-[variant=inset]:not-has-[+[data-slot=alert-dialog-body]]:has-[+[data-slot=alert-dialog-footer]]:pb-6",
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
        "flex flex-1 min-h-0 flex-col overflow-hidden",
        "first:pt-5",
        "not-has-[+[data-slot=alert-dialog-footer]]:pb-5",
        "in-data-[variant=inset]:has-[+[data-slot=alert-dialog-footer]]:pb-5",
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
        // Add extra top padding when footer is first (no header or body)
        "first:pt-6",
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
        "text-lg leading-none font-semibold tracking-tight",
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
      className={cn("text-muted-foreground text-sm", className)}
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
