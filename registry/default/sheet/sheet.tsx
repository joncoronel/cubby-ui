"use client";

import * as React from "react";
import { Dialog as BaseSheet } from "@base-ui-components/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof BaseSheet.Root>) {
  return <BaseSheet.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof BaseSheet.Trigger>) {
  return <BaseSheet.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof BaseSheet.Close>) {
  return <BaseSheet.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof BaseSheet.Portal>) {
  return <BaseSheet.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof BaseSheet.Backdrop>) {
  return (
    <BaseSheet.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-10 bg-black/50 transition-all duration-200 ease-out data-closed:duration-150 data-open:duration-200 [&[data-ending-style]]:opacity-0 [&[data-starting-style]]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  variant = "default",
  ...props
}: React.ComponentProps<typeof BaseSheet.Popup> & {
  side?: "top" | "right" | "bottom" | "left";
  variant?: "default" | "floating";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <BaseSheet.Popup
        data-slot="sheet-content"
        className={cn(
          "bg-popover text-popover-foreground fixed z-10 flex flex-col gap-5 outline-hidden transition ease-out data-closed:duration-150 data-open:duration-200",
          variant === "floating" && "ring-border/70 max-h-[calc(100vh-2rem)] rounded-xl shadow-[0_16px_32px_0_oklch(0.18_0_0_/_0.16)] ring-1",
          variant === "default" && "shadow-lg",
          variant === "floating" && side === "right" &&
            "inset-y-0 top-4 right-0 h-full w-3/4 origin-right -translate-x-4 sm:max-w-sm [&[data-ending-style]]:translate-x-full [&[data-starting-style]]:translate-x-full",
          variant === "floating" && side === "left" &&
            "inset-y-0 top-4 left-0 h-full w-3/4 origin-left translate-x-4 sm:max-w-sm [&[data-ending-style]]:-translate-x-full [&[data-starting-style]]:-translate-x-full",
          variant === "floating" && side === "top" &&
            "inset-x-0 top-0 mx-auto h-auto w-[calc(100vw-2rem)] origin-top translate-y-4 [&[data-ending-style]]:-translate-y-full [&[data-starting-style]]:-translate-y-full",
          variant === "floating" && side === "bottom" &&
            "inset-x-0 bottom-0 mx-auto h-auto w-[calc(100vw-2rem)] origin-bottom -translate-y-4 [&[data-ending-style]]:translate-y-full [&[data-starting-style]]:translate-y-full",
          variant === "default" && side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 origin-right sm:max-w-sm [&[data-ending-style]]:translate-x-full [&[data-starting-style]]:translate-x-full",
          variant === "default" && side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 origin-left sm:max-w-sm [&[data-ending-style]]:-translate-x-full [&[data-starting-style]]:-translate-x-full",
          variant === "default" && side === "top" &&
            "inset-x-0 top-0 h-auto w-full origin-top [&[data-ending-style]]:-translate-y-full [&[data-starting-style]]:-translate-y-full",
          variant === "default" && side === "bottom" &&
            "inset-x-0 bottom-0 h-auto w-full origin-bottom [&[data-ending-style]]:translate-y-full [&[data-starting-style]]:translate-y-full",
          className,
        )}
        {...props}
      >
        {children}
        <SheetClose className="ring-offset-popover focus:ring-ring text-muted-foreground absolute top-5 right-5 rounded-lg opacity-50 transition-opacity duration-200 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </BaseSheet.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-2 p-5", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseSheet.Title>) {
  return (
    <BaseSheet.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseSheet.Description>) {
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
      className={cn("mt-auto flex flex-col gap-2 p-5", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetOverlay,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
};
