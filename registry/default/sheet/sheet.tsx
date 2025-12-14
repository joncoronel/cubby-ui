"use client";

import * as React from "react";
import { Dialog as BaseSheet } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const sheetContentVariants = cva(
  [
    "bg-popover text-popover-foreground fixed z-50 flex max-h-full min-h-0 w-full max-w-full min-w-0 flex-col outline-hidden",
    "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-all duration-250",
    // Nested sheet support
    "scale-[calc(1-0.05*var(--nested-dialogs))]",
    // Overlay (hidden by default, fades in/out when nested using allow-discrete)
    "after:pointer-events-none after:absolute after:inset-0 after:hidden after:rounded-[inherit] after:bg-black/5 after:opacity-0 after:transition-[opacity,display] after:duration-250 after:[transition-behavior:allow-discrete]",
    "data-nested-dialog-open:after:block data-nested-dialog-open:after:opacity-100",
    "starting:data-nested-dialog-open:after:opacity-0",
  ],
  {
    variants: {
      variant: {
        default: "shadow-lg",
        floating:
          "ring-border max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] rounded-2xl shadow-[0_16px_32px_0_oklch(0.18_0_0/0.16)] ring-1",
      },
      side: {
        top: "",
        right: "sm:max-w-sm",
        bottom: "",
        left: "sm:max-w-sm",
      },
    },
    compoundVariants: [
      // Floating variants
      {
        variant: "floating",
        side: "right",
        class:
          "inset-y-4 right-4 -translate-x-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:translate-x-[calc(100%+1rem)] data-starting-style:translate-x-[calc(100%+1rem)]",
      },
      {
        variant: "floating",
        side: "left",
        class:
          "inset-y-4 left-4 translate-x-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:-translate-x-[calc(100%+1rem)] data-starting-style:-translate-x-[calc(100%+1rem)]",
      },
      {
        variant: "floating",
        side: "top",
        class:
          "inset-x-4 top-4 translate-y-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:-translate-y-[calc(100%+1rem)] data-starting-style:-translate-y-[calc(100%+1rem)]",
      },
      {
        variant: "floating",
        side: "bottom",
        class:
          "inset-x-4 bottom-4 -translate-y-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:translate-y-[calc(100%+1rem)] data-starting-style:translate-y-[calc(100%+1rem)]",
      },
      // Default variants
      {
        variant: "default",
        side: "right",
        class:
          "inset-y-0 right-0 -translate-x-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:translate-x-full data-starting-style:translate-x-full",
      },
      {
        variant: "default",
        side: "left",
        class:
          "inset-y-0 left-0 translate-x-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:-translate-x-full data-starting-style:-translate-x-full",
      },
      {
        variant: "default",
        side: "top",
        class:
          "inset-x-0 top-0 translate-y-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:-translate-y-full data-starting-style:-translate-y-full",
      },
      {
        variant: "default",
        side: "bottom",
        class:
          "inset-x-0 bottom-0 -translate-y-[calc(1.5rem*var(--nested-dialogs))] data-ending-style:translate-y-full data-starting-style:translate-y-full",
      },
    ],
    defaultVariants: {
      variant: "default",
      side: "right",
    },
  },
);

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
}: BaseSheet.Popup.Props &
  VariantProps<typeof sheetContentVariants> & {
    showCloseButton?: boolean;
  }) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <SheetViewport>
        <BaseSheet.Popup
          data-slot="sheet-content"
          data-side={side}
          data-variant={variant}
          className={cn(sheetContentVariants({ variant, side }), className)}
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
      </SheetViewport>
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
