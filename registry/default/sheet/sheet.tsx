"use client";

import * as React from "react";
import { Dialog as BaseSheet } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

const sheetContentVariants = cva(
  [
    "bg-popover text-popover-foreground fixed z-50 flex max-h-full min-h-0 w-full max-w-full min-w-0 flex-col outline-hidden",
    "ease-[cubic-bezier(.32,.72,0,1)] transition-all duration-400",
    // Nested sheet support
    "scale-[calc(1-0.05*var(--nested-dialogs))]",
    // Overlay (hidden by default, fades in/out when nested using allow-discrete)
    "after:pointer-events-none after:absolute after:inset-0 after:hidden after:rounded-[inherit] after:bg-black/10 after:opacity-0 after:transition-[opacity,display] after:duration-400 after:transition-discrete",
    "data-nested-dialog-open:after:block data-nested-dialog-open:after:opacity-100",
    "starting:data-nested-dialog-open:after:opacity-0",
  ],
  {
    variants: {
      variant: {
        default: "shadow-lg ring-border ring-1",
        floating:
          "max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] rounded-2xl",
      },
      side: {
        top: "",
        right: "sm:max-w-md",
        bottom: "",
        left: "sm:max-w-md",
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

interface SheetConfigContextValue {
  modal: boolean | "trap-focus";
}

const SheetConfigContext = React.createContext<SheetConfigContextValue>({
  modal: true,
});

function Sheet<Payload>({
  modal = true,
  disablePointerDismissal,
  ...props
}: BaseSheet.Root.Props<Payload>) {
  const configValue = React.useMemo(() => ({ modal }), [modal]);
  return (
    <SheetConfigContext.Provider value={configValue}>
      <BaseSheet.Root
        modal={modal}
        disablePointerDismissal={disablePointerDismissal ?? modal !== true}
        {...props}
      />
    </SheetConfigContext.Provider>
  );
}

const createSheetHandle = BaseSheet.createHandle;

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
        "fixed inset-0 min-h-dvh bg-black/40 transition-all duration-400 ease-[cubic-bezier(.32,.72,0,1)] supports-[-webkit-touch-callout:none]:absolute",
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
  footerVariant = "default",
  showCloseButton = true,
  ...props
}: BaseSheet.Popup.Props &
  VariantProps<typeof sheetContentVariants> & {
    footerVariant?: "default" | "inset";
    showCloseButton?: boolean;
  }) {
  const { modal } = React.useContext(SheetConfigContext);
  const isModal = modal === true;
  return (
    <SheetPortal>
      {isModal && <SheetBackdrop />}
      <SheetViewport className={cn(!isModal && "pointer-events-none")}>
        <BaseSheet.Popup
          data-slot="sheet-content"
          data-side={side}
          data-variant={variant}
          data-footer-variant={footerVariant}
          className={cn(
            sheetContentVariants({ variant, side }),
            !isModal && "pointer-events-auto",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetClose
              aria-label="Close"
              className="absolute end-2 top-2"
              render={<Button size="icon_sm" variant="ghost" />}
            >
              <XIcon />
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
        "flex flex-col gap-2 px-6 pt-6 pb-3",
        // Spacious bottom padding when header is directly before footer (no body)
        "not-has-[+[data-slot=sheet-body]]:has-[+[data-slot=sheet-footer]]:pb-6",
        // Add extra bottom padding when header is alone (no body or footer)
        "not-has-[+[data-slot=sheet-body]]:not-has-[+[data-slot=sheet-footer]]:pb-6",
        // Inset footer variant: add extra bottom padding when header is directly before footer (no body)
        "in-data-[footer-variant=inset]:not-has-[+[data-slot=sheet-body]]:has-[+[data-slot=sheet-footer]]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function SheetBody({
  className,
  nativeScroll = false,
  fadeEdges = true,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  nativeScroll?: boolean;
} & Pick<
    ScrollAreaProps,
    "fadeEdges" | "scrollbarGutter" | "persistScrollbar" | "hideScrollbar"
  >) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        "first:pt-5",
        "not-has-[+[data-slot=sheet-footer]]:pb-5",
        "in-data-[footer-variant=inset]:has-[+[data-slot=sheet-footer]]:pb-5",
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

function SheetTitle({ className, ...props }: BaseSheet.Title.Props) {
  return (
    <BaseSheet.Title
      data-slot="sheet-title"
      className={cn(
        "text-foreground text-lg leading-none font-semibold tracking-tight text-balance",
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
      className={cn("text-muted-foreground text-sm text-pretty", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 px-6 pt-4 pb-6 sm:flex-row sm:justify-end",
        // Add extra top padding when footer is first (no header or body)
        "first:pt-6",
        // Reduce top padding when body is present
        "not-in-data-[footer-variant=inset]:in-[[data-slot=sheet-content]:has([data-slot=sheet-body])]:pt-3",
        // Inset variant: muted background with top border for separation
        "in-data-[footer-variant=inset]:border-border in-data-[footer-variant=inset]:bg-muted/72 in-data-[footer-variant=inset]:border-t in-data-[footer-variant=inset]:pt-4 in-data-[footer-variant=inset]:pb-4",
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
