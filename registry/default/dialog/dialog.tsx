"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

const Dialog = BaseDialog.Root;

const createDialogHandle = BaseDialog.createHandle;

function DialogPortal({ ...props }: BaseDialog.Portal.Props) {
  return <BaseDialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogTrigger({ ...props }: BaseDialog.Trigger.Props) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({ ...props }: BaseDialog.Close.Props) {
  return <BaseDialog.Close data-slot="dialog-close" {...props} />;
}

function DialogBackdrop({ className, ...props }: BaseDialog.Backdrop.Props) {
  return (
    <BaseDialog.Backdrop
      className={cn(
        "ease-out-cubic fixed inset-0 min-h-dvh bg-black/40 transition-all duration-200 supports-[-webkit-touch-callout:none]:absolute",
        "backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogViewport({ className, ...props }: BaseDialog.Viewport.Props) {
  return (
    <BaseDialog.Viewport
      data-slot="dialog-viewport"
      className={cn(
        "fixed inset-0 flex items-center justify-center overflow-hidden px-4 py-6",
        className,
      )}
      {...props}
    />
  );
}

// Content component
function DialogContent({
  className,
  children,
  showCloseButton = true,
  variant = "default",
  ...props
}: BaseDialog.Popup.Props & {
  showCloseButton?: boolean;
  variant?: "default" | "inset";
}) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogViewport>
        <BaseDialog.Popup
          data-variant={variant}
          className={cn(
            "bg-popover text-popover-foreground relative z-50 flex max-h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden shadow-lg",
            "ring-border rounded-2xl ring-1 sm:max-w-lg",
            // Mobile: bottom sheet style
            // "right-0 bottom-0 left-0 rounded-t-lg",
            // Desktop: centered modal
            "-translate-y-[calc(1.25rem*var(--nested-dialogs))]",

            // Scale effect for nested dialogs on desktop
            "scale-[calc(1-0.1*var(--nested-dialogs))]",
            // Animation duration
            "ease-out-cubic transition-all duration-200",
            // Desktop animations: scale and fade
            "data-starting-style:translate-y-[calc(1.25rem)] data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:translate-y-[calc(1.25rem)] data-ending-style:scale-95 data-ending-style:opacity-0",
            // Nested dialog overlay (hidden by default, fades in/out using allow-discrete)
            "after:pointer-events-none after:absolute after:inset-0 after:hidden after:rounded-[inherit] after:bg-black/5 after:opacity-0 after:transition-[opacity,display] after:transition-discrete after:duration-200",
            "data-nested-dialog-open:after:block data-nested-dialog-open:after:opacity-100",
            "starting:data-nested-dialog-open:after:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogClose className="focus-visible:outline-ring/50 absolute top-4 right-4 rounded-sm opacity-70 outline-0 outline-offset-0 outline-transparent transition-opacity outline-solid hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none">
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </BaseDialog.Popup>
      </DialogViewport>
    </DialogPortal>
  );
}

// Header component
function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col space-y-1.5 px-6 pt-6 pb-4",
        // Reduce bottom padding when header is directly before footer (no body) to maintain p-5 total gap
        "not-has-[+[data-slot=dialog-body]]:has-[+[data-slot=dialog-footer]]:pb-1",
        // Add extra bottom padding when header is alone (no body or footer)
        "not-has-[+[data-slot=dialog-body]]:not-has-[+[data-slot=dialog-footer]]:pb-6",
        // Inset variant: add extra bottom padding when header is directly before footer (no body)
        "in-data-[variant=inset]:not-has-[+[data-slot=dialog-body]]:has-[+[data-slot=dialog-footer]]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

// Body component
function DialogBody({
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
  // Wrapper handles flex sizing and sibling-dependent padding
  const wrapperClassName = cn(
    "flex-1 min-h-0",
    // Add extra top padding when body is first (no header)
    "first:pt-5",
    // Add extra bottom padding when body is not followed by footer
    "not-has-[+[data-slot=dialog-footer]]:pb-5",
    // Inset variant: add bottom padding before bordered footer
    "in-data-[variant=inset]:has-[+[data-slot=dialog-footer]]:pb-5",
  );

  // Content padding and user layout classes
  const contentClassName = cn(
    // Padding with extra space for focus rings (p-1 = 4px accommodates 2px offset + 2px ring)
    "px-6 py-1",
    className,
  );

  if (nativeScroll) {
    return (
      <div
        data-slot="dialog-body"
        className={cn(wrapperClassName, contentClassName, "overflow-y-auto")}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-slot="dialog-body"
      className={cn(wrapperClassName, "flex flex-col")}
    >
      <ScrollArea
        className="flex-1"
        fadeEdges={fadeEdges}
        scrollbarGutter={scrollbarGutter}
        persistScrollbar={persistScrollbar}
        hideScrollbar={hideScrollbar}
      >
        <div className={contentClassName} {...props}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

// Footer component
function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
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

// Title component
function DialogTitle({ className, ...props }: BaseDialog.Title.Props) {
  return (
    <BaseDialog.Title
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

// Description component
function DialogDescription({
  className,
  ...props
}: BaseDialog.Description.Props) {
  return (
    <BaseDialog.Description
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogBackdrop,
  DialogViewport,
  createDialogHandle,
};
