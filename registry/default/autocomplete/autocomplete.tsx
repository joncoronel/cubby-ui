import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui-components/react/autocomplete";
import { cn } from "@/lib/utils";

const AutocompleteRoot = BaseAutocomplete.Root;

function AutocompleteInput({
  className,
  ...props
}: BaseAutocomplete.Input.Props) {
  return (
    <BaseAutocomplete.Input
      data-slot="autocomplete-input"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input border-border/80 flex w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.03)] transition-colors duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
        "file:text-foreground file:inline-flex file:h-7 file:rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-3",
        "aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteTrigger({
  className,
  children,
  ...props
}: BaseAutocomplete.Trigger.Props) {
  return (
    <BaseAutocomplete.Trigger
      data-slot="autocomplete-trigger"
      className={cn(
        "border-border/70 bg-card hover:bg-accent/5 inline-flex h-9 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.04)] transition-colors disabled:pointer-events-none disabled:opacity-60",
        "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-3",
        className,
      )}
      {...props}
    >
      {children}
    </BaseAutocomplete.Trigger>
  );
}

function AutocompleteIcon({
  className,
  ...props
}: BaseAutocomplete.Icon.Props) {
  return (
    <BaseAutocomplete.Icon
      data-slot="autocomplete-icon"
      className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", className)}
      {...props}
    />
  );
}

function AutocompleteClear({
  className,
  ...props
}: BaseAutocomplete.Clear.Props) {
  return (
    <BaseAutocomplete.Clear
      data-slot="autocomplete-clear"
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none",
        "focus-visible:border-ring focus-visible:ring-ring/30 outline-none focus-visible:ring-3",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteValue({ ...props }: BaseAutocomplete.Value.Props) {
  return <BaseAutocomplete.Value data-slot="autocomplete-value" {...props} />;
}

function AutocompletePortal({ ...props }: BaseAutocomplete.Portal.Props) {
  return <BaseAutocomplete.Portal data-slot="autocomplete-portal" {...props} />;
}

function AutocompleteBackdrop({
  className,
  ...props
}: BaseAutocomplete.Backdrop.Props) {
  return (
    <BaseAutocomplete.Backdrop
      data-slot="autocomplete-backdrop"
      className={cn(
        "fixed inset-0 z-30 bg-black/50 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompletePositioner({
  className,
  ...props
}: BaseAutocomplete.Positioner.Props) {
  return (
    <BaseAutocomplete.Positioner
      data-slot="autocomplete-positioner"
      sideOffset={6}
      className={cn("", className)}
      {...props}
    />
  );
}

function AutocompletePopup({
  className,
  ...props
}: BaseAutocomplete.Popup.Props) {
  return (
    <BaseAutocomplete.Popup
      data-slot="autocomplete-popup"
      className={cn(
        "bg-popover text-popover-foreground outline-border/70 max-h-[min(var(--available-height),23rem)] w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] scroll-pt-2 scroll-pb-2 overflow-y-auto overscroll-contain rounded-md p-1 shadow-[0_8px_20px_0_oklch(0.18_0_0_/_0.10)] outline transition-[transform,scale,opacity] duration-100 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteArrow({
  className,
  ...props
}: BaseAutocomplete.Arrow.Props) {
  return (
    <BaseAutocomplete.Arrow
      data-slot="autocomplete-arrow"
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
    </BaseAutocomplete.Arrow>
  );
}

function AutocompleteStatus({
  className,
  ...props
}: BaseAutocomplete.Status.Props) {
  return (
    <BaseAutocomplete.Status
      data-slot="autocomplete-status"
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-sm leading-5 empty:m-0 empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteEmpty({
  className,
  ...props
}: BaseAutocomplete.Empty.Props) {
  return (
    <BaseAutocomplete.Empty
      data-slot="autocomplete-empty"
      className={cn(
        "text-muted-foreground px-2.5 py-2 text-sm empty:m-0 empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteList({
  className,
  ...props
}: BaseAutocomplete.List.Props) {
  return (
    <BaseAutocomplete.List
      data-slot="autocomplete-list"
      className={cn("", className)}
      {...props}
    />
  );
}

function AutocompleteCollection({
  ...props
}: BaseAutocomplete.Collection.Props) {
  return (
    <BaseAutocomplete.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  );
}

function AutocompleteRow({ className, ...props }: BaseAutocomplete.Row.Props) {
  return (
    <BaseAutocomplete.Row
      data-slot="autocomplete-row"
      className={cn("flex", className)}
      {...props}
    />
  );
}

function AutocompleteItem({
  className,
  ...props
}: BaseAutocomplete.Item.Props) {
  return (
    <BaseAutocomplete.Item
      data-slot="autocomplete-item"
      className={cn(
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center rounded-[8px] px-2.5 py-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteGroup({
  className,
  ...props
}: BaseAutocomplete.Group.Props) {
  return (
    <BaseAutocomplete.Group
      data-slot="autocomplete-group"
      className={cn("text-foreground block pb-2", className)}
      {...props}
    />
  );
}

function AutocompleteGroupLabel({
  className,
  ...props
}: BaseAutocomplete.GroupLabel.Props) {
  return (
    <BaseAutocomplete.GroupLabel
      data-slot="autocomplete-group-label"
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  );
}

function AutocompleteSeparator({
  className,
  ...props
}: BaseAutocomplete.Separator.Props) {
  return (
    <BaseAutocomplete.Separator
      data-slot="autocomplete-separator"
      className={cn("bg-border/20 -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export const Autocomplete = {
  Root: AutocompleteRoot,
  Input: AutocompleteInput,
  Trigger: AutocompleteTrigger,
  Icon: AutocompleteIcon,
  Clear: AutocompleteClear,
  Value: AutocompleteValue,
  Portal: AutocompletePortal,
  Backdrop: AutocompleteBackdrop,
  Positioner: AutocompletePositioner,
  Popup: AutocompletePopup,
  Arrow: AutocompleteArrow,
  Status: AutocompleteStatus,
  Empty: AutocompleteEmpty,
  List: AutocompleteList,
  Collection: AutocompleteCollection,
  Row: AutocompleteRow,
  Item: AutocompleteItem,
  Group: AutocompleteGroup,
  GroupLabel: AutocompleteGroupLabel,
  Separator: AutocompleteSeparator,
  useFilter: BaseAutocomplete.useFilter,
};

export {
  AutocompleteRoot,
  AutocompleteInput,
  AutocompleteTrigger,
  AutocompleteIcon,
  AutocompleteClear,
  AutocompleteValue,
  AutocompletePortal,
  AutocompleteBackdrop,
  AutocompletePositioner,
  AutocompletePopup,
  AutocompleteArrow,
  AutocompleteStatus,
  AutocompleteEmpty,
  AutocompleteList,
  AutocompleteCollection,
  AutocompleteRow,
  AutocompleteItem,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteSeparator,
};
