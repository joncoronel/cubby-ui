"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = BaseDialog.Root;

function DialogPortal({ ...props }: BaseDialog.Portal.Props) {
  return <BaseDialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogTrigger({ ...props }: BaseDialog.Trigger.Props) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({ ...props }: BaseDialog.Close.Props) {
  return <BaseDialog.Close data-slot="dialog-close" {...props} />;
}

// Backdrop/Overlay component
function DialogBackdrop({ className, ...props }: BaseDialog.Backdrop.Props) {
  return (
    <BaseDialog.Backdrop
      className={cn(
        "ease-out-cubic fixed inset-0 bg-black/40 transition-opacity duration-150 dark:bg-black/60",
        "data-ending-style:opacity-0 data-starting-style:opacity-0",
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
  backdropClassName,
  ...props
}: BaseDialog.Popup.Props & {
  showCloseButton?: boolean;
  backdropClassName?: string;
}) {
  return (
    <DialogPortal>
      <DialogBackdrop className={backdropClassName} />
      <BaseDialog.Popup
        className={cn(
          "bg-popover text-popover-foreground fixed z-50 grid w-full gap-4 p-6 shadow-lg",
          "ring-border/60 max-w-[calc(100%-1rem)] rounded-lg ring-1 sm:max-w-lg",
          // Mobile: bottom sheet style
          // "right-0 bottom-0 left-0 rounded-t-lg",
          // Desktop: centered modal
          "top-[calc(50%-1.25rem*var(--nested-dialogs))] bottom-auto left-1/2",
          "translate-x-[-50%] translate-y-[-50%]",
          // Scale effect for nested dialogs on desktop
          "scale-[calc(1-0.1*var(--nested-dialogs))]",
          // Animation duration
          "transition-all duration-100 ease-out data-open:duration-150",
          // Desktop animations: scale and fade
          "data-starting-style:translate-y-[calc(-50%+1.25rem)] data-starting-style:scale-95 data-starting-style:opacity-0",
          "data-ending-style:translate-y-[calc(-50%+1.25rem)] data-ending-style:scale-95 data-ending-style:opacity-0",
          // Nested dialog overlay
          "data-nested-dialog-open:after:absolute data-nested-dialog-open:after:inset-0",
          "data-nested-dialog-open:after:rounded-[inherit] data-nested-dialog-open:after:bg-black/5",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 outline-0 outline-offset-0 outline-transparent outline-solid transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 disabled:pointer-events-none">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
      </BaseDialog.Popup>
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
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

// Footer component
function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
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
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogBackdrop,
};
