"use client";

import * as React from "react";
import { Autocomplete as AutocompleteBase } from "@base-ui-components/react/autocomplete";
import { SearchIcon } from "lucide-react";

import { Dialog, DialogContent } from "@/registry/default/dialog/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";

import { cn } from "@/lib/utils";

function Command<ItemValue = any>({
  className,
  items = [],
  children,
  ...props
}: AutocompleteBase.Root.Props<ItemValue> & {
  className?: string;
}) {
  return (
    <div
      data-slot="command"
      className={cn(
        "text-popover-foreground bg-muted flex h-full w-full flex-col rounded-4xl p-1 dark:shadow-none",
        className,
      )}
    >
      <AutocompleteBase.Root items={items} {...(props as any)}>
        {children}
      </AutocompleteBase.Root>
    </div>
  );
}

function CommandDialog({
  children,
  className,
  backdropClassName,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  className?: string;
  backdropClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn(
          "rounded-4xl border-none bg-transparent p-0 shadow-lg ring-0 [&_[data-slot='dialog-close']]:hidden",
          className,
        )}
        backdropClassName={backdropClassName}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: AutocompleteBase.Input.Props) {
  return (
    <InputGroup className={cn("mt-2 w-[calc(100%-1rem)]", className)}>
      <AutocompleteBase.Input
        data-slot="command-input"
        render={(props) => <InputGroupInput {...props} />}
        {...props}
      />
      <InputGroupAddon>
        <SearchIcon className="size-4" />
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
        "bg-card ring-border/25 dark:ring-border/10 flex flex-col items-center rounded-2xl ring-1",
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
  ...props
}: AutocompleteBase.List.Props & {
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
        className={cn(
          "max-h-[300px] w-full overflow-x-hidden overflow-y-auto p-1 outline-hidden empty:m-0 empty:p-0",
          className,
        )}
        {...props}
      >
        {children}
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
      className={cn("text-foreground overflow-hidden p-1", className)}
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
        "text-muted-foreground px-2.5 py-2 text-xs font-medium",
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
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: AutocompleteBase.Item.Props) {
  return (
    <AutocompleteBase.Item
      data-slot="command-item"
      className={cn(
        "group data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:[&_svg:not([class*='text-'])]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground text-foreground data-[highlighted]:ring-border/70 relative flex cursor-default items-center gap-2 rounded-sm p-2.5 text-sm font-medium outline-hidden transition-[colors,background-color,box-shadow] duration-100 ease-out select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:ring-1 data-[highlighted]:duration-0 sm:py-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandCollection({
  ...props
}: AutocompleteBase.Collection.Props) {
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
        "text-muted-foreground hidden items-center justify-between px-3 py-2 pb-1 text-xs sm:flex",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandContent,
  CommandList,
  CommandGroup,
  CommandGroupLabel,
  CommandCollection,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandFooter,
};
