"use client";

import * as React from "react";
// import * as ComboboxPrimitive from "@base-ui/react/combobox";
import { cn } from "@/lib/utils";
import { X, CheckIcon, ChevronDown } from "lucide-react";
import { Label } from "@/registry/default/label/label";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";

const useFilter = BaseCombobox.useFilter;

const ComboboxContext = React.createContext<{
  id: string;
  chipsRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: BaseCombobox.Root.Props<Value, Multiple>,
): React.JSX.Element {
  const id = React.useId();
  const chipsRef = React.useRef<HTMLDivElement | null>(null);

  const contextValue = React.useMemo(() => ({ id, chipsRef }), [id]);

  return (
    <ComboboxContext.Provider value={contextValue}>
      <BaseCombobox.Root data-slot="combobox" {...props} />
    </ComboboxContext.Provider>
  );
}

function ComboboxInput({
  id: idProp,
  className,
  ...props
}: BaseCombobox.Input.Props) {
  const context = React.useContext(ComboboxContext);
  const id = idProp ?? context?.id;

  return (
    <BaseCombobox.Input
      id={id}
      data-slot="combobox-input"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input dark:bg-input/30 border-border py- flex h-10 w-full min-w-0 rounded-lg border px-3 text-base font-normal shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.03)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 md:text-sm",
        "file:text-foreground file:inline-flex file:h-7 file:rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxInputWrapper({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-input-wrapper"
      className={cn(
        "relative",
        // Auto-adjust input padding based on buttons present (right-3 = 0.75rem, button = 1rem)
        "has-[[data-slot=combobox-clear]]:[&_[data-slot=combobox-input]]:pr-[1.75rem]",
        "has-[[data-slot=combobox-trigger]]:[&_[data-slot=combobox-input]]:pr-[1.75rem]",
        // Both buttons present (0.75rem + 1rem + 0.5rem gap + 1rem button = 3.25rem)
        "has-[[data-slot=combobox-clear]]:has-[[data-slot=combobox-trigger]]:[&_[data-slot=combobox-input]]:pr-[3.25rem]",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChipInput({
  id: idProp,
  className,
  ...props
}: BaseCombobox.Input.Props) {
  const context = React.useContext(ComboboxContext);
  const id = idProp ?? context?.id;

  return (
    <BaseCombobox.Input
      id={id}
      data-slot="combobox-input"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-7 min-w-12 flex-1 rounded-none border-none bg-transparent p-0 pl-1.5 text-base font-normal shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:h-6 md:text-sm",

        className,
      )}
      {...props}
    />
  );
}

function ComboboxTrigger({ className, ...props }: BaseCombobox.Trigger.Props) {
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      aria-label="Open popup"
      className={cn(
        "inline-flex size-4 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-60",
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-3",

        className,
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </BaseCombobox.Trigger>
  );
}

function ComboboxIcon({ className, ...props }: BaseCombobox.Icon.Props) {
  return (
    <BaseCombobox.Icon
      data-slot="combobox-icon"
      className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", className)}
      {...props}
    />
  );
}

function ComboboxClear({ className, ...props }: BaseCombobox.Clear.Props) {
  return (
    <BaseCombobox.Clear
      data-slot="combobox-clear"
      aria-label="Clear selection"
      className={cn(
        "inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-[opacity,scale,transform,translate] hover:opacity-100 disabled:pointer-events-none",
        "focus-visible:border-ring focus-visible:ring-ring/30 duration-100 outline-none focus-visible:ring-3",
        "data-[ending-style]:translate-x-1 data-[ending-style]:opacity-0 data-[starting-style]:translate-x-1 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </BaseCombobox.Clear>
  );
}

function ComboboxValue({ ...props }: BaseCombobox.Value.Props) {
  return <BaseCombobox.Value data-slot="combobox-value" {...props} />;
}

function ComboboxPortal({ ...props }: BaseCombobox.Portal.Props) {
  return <BaseCombobox.Portal data-slot="combobox-portal" {...props} />;
}

function ComboboxBackdrop({
  className,
  ...props
}: BaseCombobox.Backdrop.Props) {
  return (
    <BaseCombobox.Backdrop
      data-slot="combobox-backdrop"
      className={cn(
        "fixed inset-0 z-30 bg-black/50 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxPositioner({
  className,
  ...props
}: BaseCombobox.Positioner.Props) {
  return (
    <BaseCombobox.Positioner
      data-slot="combobox-positioner"
      sideOffset={6}
      className={cn("", className)}
      {...props}
    />
  );
}

function ComboboxPopupPrimitive({
  className,
  ...props
}: BaseCombobox.Popup.Props) {
  return (
    <BaseCombobox.Popup
      data-slot="combobox-popup"
      className={cn(
        "bg-popover text-popover-foreground outline-border/70 ring-border/50 dark:ring-border ease-out-cubic flex max-h-[min(var(--available-height),20rem)] w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] flex-col overflow-clip overscroll-contain rounded-xl shadow-[0_8px_20px_0_oklch(0.18_0_0_/_0.10)] ring-1 transition-[transform,scale,opacity] duration-100 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxArrow({ className, ...props }: BaseCombobox.Arrow.Props) {
  return (
    <BaseCombobox.Arrow
      data-slot="combobox-arrow"
      className={cn(
        "data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180",
        className,
      )}
      {...props}
    >
      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
        <path
          d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V9H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
          className="fill-popover"
        />
        <path
          d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
          className="fill-border/70"
        />
      </svg>
    </BaseCombobox.Arrow>
  );
}

function ComboboxStatus({ className, ...props }: BaseCombobox.Status.Props) {
  return (
    <BaseCombobox.Status
      data-slot="combobox-status"
      className={cn(
        "text-muted-foreground px-3 py-2.5 text-sm leading-5 empty:m-0 empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxEmpty({ className, ...props }: BaseCombobox.Empty.Props) {
  return (
    <BaseCombobox.Empty
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground px-3 py-2.5 text-sm empty:m-0 empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxList({
  className,
  nativeScroll = false,
  fadeEdges = true,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  ...props
}: BaseCombobox.List.Props & {
  nativeScroll?: boolean;
} & Pick<ScrollAreaProps, "fadeEdges" | "scrollbarGutter" | "persistScrollbar" | "hideScrollbar">) {
  if (nativeScroll) {
    return (
      <BaseCombobox.List
        data-slot="combobox-list"
        className={cn("overflow-y-auto not-empty:p-1", className)}
        {...props}
      />
    );
  }

  return (
    <ScrollArea
      fadeEdges={fadeEdges}
      scrollbarGutter={scrollbarGutter}
      persistScrollbar={persistScrollbar}
      hideScrollbar={hideScrollbar}
    >
      <BaseCombobox.List
        data-slot="combobox-list"
        className={cn("not-empty:p-1", className)}
        {...props}
      />
    </ScrollArea>
  );
}

function ComboboxCollection({ ...props }: BaseCombobox.Collection.Props) {
  return <BaseCombobox.Collection data-slot="combobox-collection" {...props} />;
}

function ComboboxRow({ className, ...props }: BaseCombobox.Row.Props) {
  return (
    <BaseCombobox.Row
      data-slot="combobox-row"
      className={cn("flex", className)}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: BaseCombobox.Item.Props) {
  return (
    <BaseCombobox.Item
      data-slot="combobox-item"
      className={cn(
        "data-[highlighted]:bg-accent/50 data-[highlighted]:text-accent-foreground relative grid cursor-default grid-cols-[1fr_1rem] items-center gap-2 rounded-md px-2.5 py-2 pr-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
        className,
      )}
      {...props}
    >
      <div className="break-all">{children}</div>
      <BaseCombobox.ItemIndicator render={<CheckIcon className="size-4" />} />
    </BaseCombobox.Item>
  );
}

function ComboboxItemIndicator({
  className,
  ...props
}: BaseCombobox.ItemIndicator.Props) {
  return (
    <BaseCombobox.ItemIndicator
      data-slot="combobox-item-indicator"
      className={cn("", className)}
      {...props}
    />
  );
}

function ComboboxGroup({ className, ...props }: BaseCombobox.Group.Props) {
  return (
    <BaseCombobox.Group
      data-slot="combobox-group"
      className={cn("text-foreground block", className)}
      {...props}
    />
  );
}

function ComboboxGroupLabel({
  className,
  ...props
}: BaseCombobox.GroupLabel.Props) {
  return (
    <BaseCombobox.GroupLabel
      data-slot="combobox-group-label"
      className={cn(
        "text-muted-foreground bg-popover -mx-1 px-2 py-1.5 pt-2.5 pl-3.5 text-xs font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: BaseCombobox.Separator.Props) {
  return (
    <BaseCombobox.Separator
      data-slot="combobox-separator"
      className={cn("bg-border my-1 h-px", className)}
      {...props}
    />
  );
}

function ComboboxChips({ className, ...props }: BaseCombobox.Chips.Props) {
  const context = React.useContext(ComboboxContext);

  return (
    <BaseCombobox.Chips
      ref={context?.chipsRef}
      data-slot="combobox-chips"
      className={cn(
        "bg-input dark:bg-input/30 flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border px-1.5 py-1.5 shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.03)]",
        "focus-within:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-within:outline-2 focus-within:outline-offset-2",

        className,
      )}
      {...props}
    />
  );
}

function ComboboxChip({ className, ...props }: BaseCombobox.Chip.Props) {
  return (
    <BaseCombobox.Chip
      data-slot="combobox-chip"
      className={cn(
        "bg-accent text-accent-foreground flex items-center gap-1 rounded-sm border px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1)-1px)] text-sm font-medium break-all sm:text-xs",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChipRemove({
  className,
  ...props
}: BaseCombobox.ChipRemove.Props) {
  return (
    <BaseCombobox.ChipRemove
      data-slot="combobox-chip-remove"
      className={cn(
        "ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none",
        "focus-visible:border-ring focus-visible:ring-ring/30 cursor-pointer outline-none focus-visible:ring-3",
        className,
      )}
      {...props}
    />
  );
}

interface ComboboxPopupProps extends BaseCombobox.Popup.Props {
  sideOffset?: BaseCombobox.Positioner.Props["sideOffset"];
  backdrop?: boolean;
}

function ComboboxPopup({
  className,
  children,
  sideOffset = 6,
  backdrop = false,
  ...props
}: ComboboxPopupProps) {
  const context = React.useContext(ComboboxContext);

  return (
    <ComboboxPortal>
      {backdrop && <ComboboxBackdrop />}
      <ComboboxPositioner anchor={context?.chipsRef} sideOffset={sideOffset}>
        <ComboboxPopupPrimitive className={className} {...props}>
          {children}
        </ComboboxPopupPrimitive>
      </ComboboxPositioner>
    </ComboboxPortal>
  );
}

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const context = React.useContext(ComboboxContext);

  return <Label htmlFor={context?.id} className={className} {...props} />;
}

export {
  Combobox,
  ComboboxInput,
  ComboboxInputWrapper,
  ComboboxChipInput,
  ComboboxTrigger,
  ComboboxIcon,
  ComboboxClear,
  ComboboxValue,
  ComboboxPortal,
  ComboboxBackdrop,
  ComboboxPositioner,
  ComboboxPopupPrimitive,
  ComboboxPopup,
  ComboboxArrow,
  ComboboxStatus,
  ComboboxEmpty,
  ComboboxList,
  ComboboxCollection,
  ComboboxRow,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxLabel,
  useFilter,
};
