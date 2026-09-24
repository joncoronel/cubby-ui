"use client";

import * as React from "react";
import { Autocomplete as AutocompleteBase } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
const useCommandFilter = AutocompleteBase.useFilter;
const useCommandFilteredItems = AutocompleteBase.useFilteredItems;

const AutocompleteRoot = AutocompleteBase.Root;

function Command<ItemValue>({
  className,
  items = [],
  children,
  autoHighlight = "always",
  open = true,
  keepHighlight = true,
  level = 3,
  shadowLevel = 3,
  ...props
}: AutocompleteBase.Root.Props<ItemValue> & {
  className?: string;
  /** Surface elevation level for the outer Command frame (1-8). Defaults to 3. Bump to 7 when used inside CommandDialog so the palette pops above the dialog. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <div
      data-slot="command"
      data-level={level}
      className={cn(
        // Outer frame is surface-2 (bg-muted); CommandContent drops back to
        // surface-1 inside, creating a "panel with well" effect. bg-muted pins
        // the outer color regardless of level — only shadow weight varies.
        "text-popover-foreground flex min-h-0 flex-1 flex-col rounded-4xl p-1",
        solidSurface(level, shadowLevel),
        "bg-muted",
        className,
      )}
    >
      <AutocompleteRoot
        items={items}
        autoHighlight={autoHighlight}
        keepHighlight={keepHighlight}
        open={open}
        inline={true}
        {...props}
      >
        {children}
      </AutocompleteRoot>
    </div>
  );
}

const CommandDialog = BaseDialog.Root;

function CommandDialogTrigger({ ...props }: BaseDialog.Trigger.Props) {
  return <BaseDialog.Trigger data-slot="command-dialog-trigger" {...props} />;
}

function CommandDialogPortal({ ...props }: BaseDialog.Portal.Props) {
  return <BaseDialog.Portal data-slot="command-dialog-portal" {...props} />;
}

function CommandDialogBackdrop({
  className,
  ...props
}: BaseDialog.Backdrop.Props) {
  return (
    <BaseDialog.Backdrop
      data-slot="command-dialog-backdrop"
      className={cn(
        "ease-out-expo fixed inset-0 min-h-dvh bg-black/40 transition-all duration-200 supports-[-webkit-touch-callout:none]:absolute",
        "backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialogViewport({
  className,
  ...props
}: BaseDialog.Viewport.Props) {
  return (
    <BaseDialog.Viewport
      data-slot="command-dialog-viewport"
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-4 py-6",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialogPopup({
  className,
  children,
  ...props
}: BaseDialog.Popup.Props) {
  return (
    <CommandDialogPortal>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <BaseDialog.Popup
          data-slot="command-dialog-popup"
          className={cn(
            "relative z-50 mb-auto flex max-h-100 min-h-0 w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-4xl bg-transparent shadow-lg sm:mt-[10%]",
            // Nested dialog offset
            "-translate-y-[calc(1.25rem*var(--nested-dialogs))]",
            "scale-[calc(1-0.1*var(--nested-dialogs))]",
            // Animation
            "ease-out-expo transition-all duration-200",
            "data-starting-style:translate-y-5 data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:translate-y-5 data-ending-style:scale-95 data-ending-style:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  );
}

function CommandInput({
  className,
  loading = false,
  ...props
}: AutocompleteBase.Input.Props & { loading?: boolean }) {
  return (
    <InputGroup
      variant="elevated"
      className={cn("mt-2 w-[calc(100%-1rem)]", className)}
    >
      <AutocompleteBase.Input
        data-slot="command-input"
        render={(props) => <InputGroupInput {...props} />}
        {...props}
      />
      <InputGroupAddon>
        <HugeiconsIcon
          icon={Search01Icon}
          className={cn(
            "size-4",
            loading && "animation-duration-400 animate-pulse",
          )}
          strokeWidth={2}
        />
      </InputGroupAddon>
    </InputGroup>
  );
}

function CommandContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-content"
      className={cn(
        // Surface-1 "well" inside the surface-2 outer frame; ring defines the edge.
        "bg-surface-3 dark:bg-surface-1 ring-border/25 dark:ring-border/10 flex min-h-0 flex-1 flex-col items-center overflow-hidden rounded-2xl ring-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandList({
  className,
  children,
  emptyMessage = "No results found.",
  nativeScroll = false,
  fadeEdges = true,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  ...props
}: AutocompleteBase.List.Props &
  Pick<
    ScrollAreaProps,
    | "nativeScroll"
    | "fadeEdges"
    | "scrollbarGutter"
    | "persistScrollbar"
    | "hideScrollbar"
  > & {
    emptyMessage?: React.ReactNode;
  }) {
  return (
    <>
      <AutocompleteBase.Empty
        data-slot="command-empty"
        className="text-muted-foreground px-1 py-7 text-center text-sm empty:m-0 empty:p-0"
      >
        {emptyMessage}
      </AutocompleteBase.Empty>
      <ScrollArea
        nativeScroll={nativeScroll}
        fadeEdges={fadeEdges}
        scrollbarGutter={scrollbarGutter}
        persistScrollbar={persistScrollbar}
        hideScrollbar={hideScrollbar}
        className={cn("flex-1", className)}
        viewportClassName="scroll-py-2"
      >
        <AutocompleteBase.List
          data-slot="command-list"
          className="rounded-xl py-2 outline-hidden empty:m-0 empty:p-0"
          {...props}
        >
          {children}
        </AutocompleteBase.List>
      </ScrollArea>
    </>
  );
}

function CommandVirtualizedList({
  className,
  children,
  scrollRef,
  totalSize,
  emptyMessage = "No results found.",
  fadeEdges = "y",
  nativeScroll = false,
  ...props
}: Omit<React.ComponentProps<"div">, "ref"> &
  Pick<ScrollAreaProps, "fadeEdges" | "nativeScroll"> & {
    scrollRef: (element: HTMLDivElement | null) => void;
    totalSize: number;
    emptyMessage?: React.ReactNode;
  }) {
  return (
    <>
      <AutocompleteBase.Empty
        data-slot="command-empty"
        className="text-muted-foreground px-1 py-7 text-center text-sm empty:m-0 empty:p-0"
      >
        {emptyMessage}
      </AutocompleteBase.Empty>
      <AutocompleteBase.List
        data-slot="command-list"
        className="w-full flex-1 overflow-hidden rounded-xl p-0 outline-hidden empty:m-0 empty:p-0"
      >
        <ScrollArea
          viewportRef={scrollRef}
          viewportClassName={cn("scroll-py-2", className)}
          fadeEdges={fadeEdges}
          nativeScroll={nativeScroll}
          className="h-auto max-h-full w-full"
          {...props}
        >
          {/* Spacer that gives TanStack Virtual its total scroll height */}
          <div
            role="presentation"
            className="relative w-full"
            style={{ height: totalSize }}
          >
            {children}
          </div>
        </ScrollArea>
      </AutocompleteBase.List>
    </>
  );
}

function CommandGroup({
  className,
  children,
  ...props
}: AutocompleteBase.Group.Props) {
  return (
    <AutocompleteBase.Group
      data-slot="command-group"
      className={cn("text-foreground block", className)}
      {...props}
    >
      {children}
    </AutocompleteBase.Group>
  );
}

function CommandGroupLabel({
  className,
  ...props
}: AutocompleteBase.GroupLabel.Props) {
  return (
    <AutocompleteBase.GroupLabel
      data-slot="command-group-label"
      className={cn(
        "text-muted-foreground mx-2 px-2.5 py-1.5 text-xs font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: AutocompleteBase.Separator.Props) {
  return (
    <AutocompleteBase.Separator
      data-slot="command-separator"
      className={cn("bg-border mx-2 my-1 h-px min-h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ref,
  ...props
}: AutocompleteBase.Item.Props & {
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <AutocompleteBase.Item
      ref={ref}
      data-slot="command-item"
      className={cn(
        "group data-highlighted:text-accent-foreground data-highlighted:[&_svg:not([class*='text-'])]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground text-foreground data-highlighted:bg-surface-hover relative flex cursor-default items-center gap-2 rounded-md p-2.5 text-sm font-medium outline-hidden transition-[colors,background-color,box-shadow] duration-100 ease-out select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-highlighted:duration-0 sm:py-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Spacing from list edges (matches input's calc(100%-1rem) gap)
        "mx-2",
        className,
      )}
      {...props}
    />
  );
}

function CommandCollection({ ...props }: AutocompleteBase.Collection.Props) {
  return (
    <AutocompleteBase.Collection data-slot="command-collection" {...props} />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto flex items-center gap-1 text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        "text-muted-foreground flex items-center justify-between px-3 py-2 pb-1 text-xs",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandDialogTrigger,
  CommandDialogPortal,
  CommandDialogBackdrop,
  CommandDialogViewport,
  CommandDialogPopup,
  CommandInput,
  CommandContent,
  CommandList,
  CommandVirtualizedList,
  CommandGroup,
  CommandGroupLabel,
  CommandCollection,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandFooter,
  useCommandFilter,
  useCommandFilteredItems,
};
