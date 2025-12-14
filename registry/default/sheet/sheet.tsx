"use client";

import * as React from "react";
import { Dialog as BaseSheet } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const createSheetHandle = BaseSheet.createHandle;

function Sheet({ ...props }: BaseSheet.Root.Props) {
  return <BaseSheet.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: BaseSheet.Trigger.Props) {
  return <BaseSheet.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: BaseSheet.Close.Props) {
  return <BaseSheet.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: BaseSheet.Portal.Props) {
  return <BaseSheet.Portal data-slot="sheet-portal" {...props} />;
}

function SheetBackdrop({ className, ...props }: BaseSheet.Backdrop.Props) {
  return (
    <BaseSheet.Backdrop
      data-slot="sheet-backdrop"
      className={cn(
        "ease-[cubic-bezier(0, 0, 0.58, 1)] fixed inset-0 bg-black/40 transition-all duration-250",
        "backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetViewport({ className, ...props }: BaseSheet.Viewport.Props) {
  return (
    <BaseSheet.Viewport
      data-slot="sheet-viewport"
      className={cn("fixed inset-0 overflow-hidden", className)}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  variant = "default",
  showCloseButton = true,
  ...props
}: BaseSheet.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  variant?: "default" | "floating";
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <BaseSheet.Popup
        data-slot="sheet-content"
        data-side={side}
        data-variant={variant}
        className={cn(
          "bg-popover text-popover-foreground fixed z-50 flex flex-col outline-hidden",
          // Transition
          "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-all duration-250",
          // Floating variant base styling
          variant === "floating" &&
            "ring-border max-h-[calc(100dvh-2rem)] rounded-2xl shadow-[0_16px_32px_0_oklch(0.18_0_0/0.16)] ring-1",
          // Default variant base styling
          variant === "default" && "shadow-lg",
          // Floating right
          variant === "floating" &&
            side === "right" &&
            "inset-y-4 right-4 h-auto w-3/4 data-ending-style:translate-x-[calc(100%+1rem)] data-starting-style:translate-x-[calc(100%+1rem)] sm:max-w-sm",
          // Floating left
          variant === "floating" &&
            side === "left" &&
            "inset-y-4 left-4 h-auto w-3/4 data-ending-style:-translate-x-[calc(100%+1rem)] data-starting-style:-translate-x-[calc(100%+1rem)] sm:max-w-sm",
          // Floating top
          variant === "floating" &&
            side === "top" &&
            "inset-x-4 top-4 h-auto w-auto data-ending-style:-translate-y-[calc(100%+1rem)] data-starting-style:-translate-y-[calc(100%+1rem)]",
          // Floating bottom
          variant === "floating" &&
            side === "bottom" &&
            "inset-x-4 bottom-4 h-auto w-auto data-ending-style:translate-y-[calc(100%+1rem)] data-starting-style:translate-y-[calc(100%+1rem)]",
          // Default right
          variant === "default" &&
            side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 data-ending-style:translate-x-full data-starting-style:translate-x-full sm:max-w-sm",
          // Default left
          variant === "default" &&
            side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 data-ending-style:-translate-x-full data-starting-style:-translate-x-full sm:max-w-sm",
          // Default top
          variant === "default" &&
            side === "top" &&
            "inset-x-0 top-0 h-auto w-full data-ending-style:-translate-y-full data-starting-style:-translate-y-full",
          // Default bottom
          variant === "default" &&
            side === "bottom" &&
            "inset-x-0 bottom-0 h-auto w-full data-ending-style:translate-y-full data-starting-style:translate-y-full",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClose className="ring-offset-popover focus:ring-ring text-muted-foreground absolute top-5 right-5 rounded-lg opacity-50 transition-opacity duration-200 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        )}
      </BaseSheet.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col space-y-1.5 px-5 pt-5 pb-3",
        // Reduce bottom padding when header is directly before footer (no body)
        "not-has-[+[data-slot=sheet-body]]:has-[+[data-slot=sheet-footer]]:pb-1",
        // Add extra bottom padding when header is alone (no body or footer)
        "not-has-[+[data-slot=sheet-body]]:not-has-[+[data-slot=sheet-footer]]:pb-5",
        className,
      )}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        "overflow-y-auto px-5 pt-1 pb-1",
        // Add extra top padding when body is first (no header)
        "first:pt-5",
        // Add extra bottom padding when body is not followed by footer
        "not-has-[+[data-slot=sheet-footer]]:pb-5",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: BaseSheet.Title.Props) {
  return (
    <BaseSheet.Title
      data-slot="sheet-title"
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: BaseSheet.Description.Props) {
  return (
    <BaseSheet.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 px-5 pt-3 pb-5 sm:flex-row sm:justify-end",
        // Add extra top padding when footer is first (no header or body)
        "first:pt-5",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetPortal,
  SheetBackdrop,
  SheetViewport,
  createSheetHandle,
};
