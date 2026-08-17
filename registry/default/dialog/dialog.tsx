"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  elevatedSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

import { HugeiconsIcon } from "@hugeicons/react";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
/**
 * `"inside"` caps the popup to the viewport and scrolls `DialogBody`.
 * `"outside"` lets the popup grow past the viewport and scrolls the area
 * around it, so the whole card (header and footer included) moves.
 */
type DialogScroll = "inside" | "outside";

interface DialogConfigContextValue {
  modal: boolean | "trap-focus";
}

const DialogConfigContext = React.createContext<DialogConfigContextValue>({
  modal: true,
});

const DialogScrollContext = React.createContext<DialogScroll>("inside");

function Dialog<Payload>({
  modal = true,
  disablePointerDismissal,
  ...props
}: BaseDialog.Root.Props<Payload>) {
  const configValue = React.useMemo(() => ({ modal }), [modal]);
  return (
    <DialogConfigContext.Provider value={configValue}>
      <BaseDialog.Root
        modal={modal}
        disablePointerDismissal={disablePointerDismissal ?? modal !== true}
        {...props}
      />
    </DialogConfigContext.Provider>
  );
}

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
        "ease-out-expo fixed inset-0 min-h-dvh bg-black/40 transition-all duration-200 supports-[-webkit-touch-callout:none]:absolute",
        "backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogViewport({
  className,
  scroll = "inside",
  ...props
}: BaseDialog.Viewport.Props & { scroll?: DialogScroll }) {
  return (
    <BaseDialog.Viewport
      data-slot="dialog-viewport"
      data-scroll={scroll}
      className={cn(
        "fixed inset-0",
        // Inside scroll: the viewport is the centering frame the popup is
        // capped against. Outside scroll: it's only the scroll port — the
        // centering and padding move onto the scrollable content instead, so
        // the popup can grow past the bottom edge.
        scroll === "inside" &&
          "flex flex-col items-center justify-center overflow-hidden px-4 py-6",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  variant = "default",
  scroll = "inside",
  level = 5,
  shadowLevel = 5,
  ref,
  initialFocus,
  ...props
}: BaseDialog.Popup.Props & {
  showCloseButton?: boolean;
  variant?: "default" | "inset";
  /** Whether the dialog body scrolls inside the popup (`"inside"`) or the area around the popup scrolls (`"outside"`). */
  scroll?: DialogScroll;
  /** Surface elevation level for the dialog bg (1-8). Defaults to 5 — the standard "dialog tier" above page/cards/popovers. Bump to 7 for a hero/critical modal. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 5 by default — matches the dialog tier, dramatic enough to anchor the modal without overpowering. Bump to 7 for hero modals. */
  shadowLevel?: SurfaceLevel;
}) {
  const { modal } = React.useContext(DialogConfigContext);
  const isModal = modal === true;
  const isOutsideScroll = scroll === "outside";

  // Outside scroll points `initialFocus` at the popup itself rather than the
  // first focusable child, so opening a tall dialog doesn't scroll straight
  // past the header. That needs our own handle on the element, kept alongside
  // any ref the caller passed.
  const popupRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      popupRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const popup = (
    <DialogScrollContext.Provider value={scroll}>
      <BaseDialog.Popup
        ref={mergedRef}
        initialFocus={initialFocus ?? (isOutsideScroll ? popupRef : undefined)}
        data-slot="dialog-content"
        data-variant={variant}
        data-level={level}
        data-scroll={scroll}
        className={cn(
          "text-popover-foreground relative z-50 flex w-full max-w-full min-w-0 flex-col overflow-hidden",
          "rounded-2xl sm:max-w-lg",
          scroll === "inside" && "max-h-full min-h-0",
          // Outside scroll parks initial focus on the popup itself, so suppress
          // the UA ring it would otherwise draw around the whole card.
          isOutsideScroll && "outline-none",
          // Surface elevation — bg + shadow + rim overlay (rim uses ::after at z-[2])
          elevatedSurface(level, shadowLevel),
          // Mobile: bottom sheet style
          // "right-0 bottom-0 left-0 rounded-t-lg",
          // Desktop: centered modal
          "-translate-y-[calc(1.25rem*var(--nested-dialogs))]",

          // Scale effect for nested dialogs on desktop
          "scale-[calc(1-0.1*var(--nested-dialogs))]",
          // Animation duration
          "ease-out-expo transition-all duration-200",
          // Desktop animations: scale and fade
          "data-starting-style:translate-y-[calc(1.25rem)] data-starting-style:scale-95 data-starting-style:opacity-0",
          "data-ending-style:translate-y-[calc(1.25rem)] data-ending-style:scale-95 data-ending-style:opacity-0",
          // Nested dialog overlay — uses ::before (not ::after, that's the rim) at z-[3] so it paints above content AND above the rim
          "before:pointer-events-none before:absolute before:inset-0 before:z-3 before:hidden before:rounded-[inherit] before:bg-black/5 before:opacity-0 before:transition-[opacity,display] before:transition-discrete before:duration-200",
          "data-nested-dialog-open:before:block data-nested-dialog-open:before:opacity-100",
          "starting:data-nested-dialog-open:before:opacity-0",
          !isModal && "pointer-events-auto",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose
            aria-label="Close"
            className="absolute end-2 top-2"
            render={<Button size="icon_sm" variant="ghost" />}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </DialogClose>
        )}
      </BaseDialog.Popup>
    </DialogScrollContext.Provider>
  );

  return (
    <DialogPortal>
      {isModal && <DialogBackdrop />}
      <DialogViewport
        scroll={scroll}
        className={cn(!isModal && "pointer-events-none")}
      >
        {isOutsideScroll ? (
          <ScrollArea
            // `min-h-full` (not `h-full`) keeps the centering box growable, so a
            // short popup sits centered and a tall one extends the scroll range
            // instead of having its top clipped out of reach.
            contentClassName="flex min-h-full items-center justify-center px-4 py-6"
          >
            {popup}
          </ScrollArea>
        ) : (
          popup
        )}
      </DialogViewport>
    </DialogPortal>
  );
}

// Slot-presence padding uses ancestor `:has()` on `[data-slot=dialog-content]`
// so header/body/footer can be wrapped in forms, ErrorBoundaries, or fragments
// without breaking spacing — adjacent-sibling selectors wouldn't reach through.
function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 px-6 pt-6 pb-3",
        // Header alone with footer (no body anywhere in content)
        "in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-body])):has([data-slot=dialog-footer])]:pb-6",
        // Header alone (no body, no footer)
        "in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-body])):not(:has([data-slot=dialog-footer]))]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

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
  const scroll = React.useContext(DialogScrollContext);

  const content = (
    <div className={cn("px-6 py-1", className)} {...props}>
      {children}
    </div>
  );

  return (
    <div
      data-slot="dialog-body"
      className={cn(
        // Outside scroll has no scroller here to fill — the body is sized by
        // its content and the area around the popup scrolls instead.
        scroll === "inside" && "flex min-h-0 flex-1 flex-col",
        // No header anywhere in content → body needs its own top padding
        "in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-header]))]:pt-5",
        // No footer anywhere in content → body needs its own bottom padding
        "in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-footer]))]:pb-5",
        // Inset variant: still need bottom padding when a footer follows so the
        // body's content doesn't crowd the footer's top border
        "in-data-[variant=inset]:in-[[data-slot=dialog-content]:has([data-slot=dialog-footer])]:pb-5",
      )}
    >
      {scroll === "outside" ? (
        content
      ) : (
        <ScrollArea
          className="flex-1"
          fadeEdges={fadeEdges}
          scrollbarGutter={scrollbarGutter}
          persistScrollbar={persistScrollbar}
          hideScrollbar={hideScrollbar}
          nativeScroll={nativeScroll}
        >
          {content}
        </ScrollArea>
      )}
    </div>
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 px-6 pt-4 pb-6 sm:flex-row sm:justify-end",
        // No header AND no body → footer alone, needs its own top padding
        "in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-header])):not(:has([data-slot=dialog-body]))]:pt-6",
        // Reduce top padding when body is present
        "not-in-data-[variant=inset]:in-[[data-slot=dialog-content]:has([data-slot=dialog-body])]:pt-3",
        // Inset variant: muted background with top border for separation
        "in-data-[variant=inset]:border-border in-data-[variant=inset]:bg-muted in-data-[variant=inset]:rounded-b-2xl in-data-[variant=inset]:border-t in-data-[variant=inset]:pt-4 in-data-[variant=inset]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: BaseDialog.Title.Props) {
  return (
    <BaseDialog.Title
      className={cn(
        "text-foreground text-lg leading-none font-semibold tracking-tight text-balance",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: BaseDialog.Description.Props) {
  return (
    <BaseDialog.Description
      className={cn("text-muted-foreground text-sm text-pretty", className)}
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
export type { DialogScroll };
