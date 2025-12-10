"use client";

import * as React from "react";
import Link from "next/link";
import {
  CornerDownLeftIcon,
  Search,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommandContent,
  CommandFooter,
} from "@/registry/default/command/command";
import { Kbd } from "@/registry/default/kbd/kbd";
import { componentGroups, type ComponentItem, type ComponentGroup } from "@/config/components";

export function ComponentSearch() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div className="hidden sm:block @xl:block">
        <button
          onClick={() => setOpen(true)}
          className="focus-visible:ring-ring border-border bg-muted/50 hover:bg-accent hover:text-accent-foreground text-muted-foreground relative inline-flex h-9 w-35 items-center justify-between gap-2 rounded-md border px-4 py-2 pr-12 text-sm font-medium whitespace-nowrap shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 @2xl:w-40 @3xl:w-64"
        >
          <span className="hidden @3xl:inline-flex">Search components...</span>
          <span className="inline-flex @3xl:hidden">Search...</span>
          <Kbd
            keys={["cmd", "k"]}
            size="sm"
            className="bg-muted text-muted-foreground pointer-events-none absolute top-1.5 right-1.5 flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none"
          />
        </button>
      </div>
      <div className="sm:hidden @xl:hidden">
        <button
          onClick={() => setOpen(true)}
          className="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Search components"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className={
          "transition-all duration-150 ease-out max-sm:top-4 max-sm:translate-y-0 max-sm:has-[input:placeholder-shown]:shadow-none max-sm:data-[ending-style]:-translate-y-2 max-sm:data-[ending-style]:scale-none max-sm:data-[ending-style]:blur-xs max-sm:data-[starting-style]:-translate-y-4 max-sm:data-[starting-style]:scale-none max-sm:data-[starting-style]:blur-xs"
        }
      >
        <Command
          items={componentGroups}
          autoHighlight
          open={open}
          className="transition-all duration-150! ease-out max-sm:has-[input:placeholder-shown]:!bg-transparent max-sm:has-[input:placeholder-shown]:p-0 max-sm:has-[input:placeholder-shown]:shadow-none max-sm:has-[input:placeholder-shown]:!ring-0"
        >
          <CommandContent className="transition-all duration-150! ease-out max-sm:has-[input:not(:placeholder-shown)]:*:pointer-events-auto max-sm:has-[input:placeholder-shown]:!bg-transparent max-sm:has-[input:placeholder-shown]:!ring-0 max-sm:has-[input:not(:placeholder-shown)]:*:data-[slot=command-list]:block">
            <CommandInput
              placeholder="Search components..."
              className="transition-all duration-150! ease-out max-sm:has-[input:placeholder-shown]:mt-0 max-sm:has-[input:placeholder-shown]:w-full max-sm:has-[input:placeholder-shown]:rounded-xl max-sm:has-[input:placeholder-shown]:shadow-2xl max-sm:[&_svg]:size-5 max-sm:[&>input]:py-3 max-sm:[&>input]:text-lg"
            />
            <CommandList
              emptyMessage="No results found."
              className="max-sm:pointer-events-none max-sm:hidden"
            >
              {(group: ComponentGroup, index: number) => (
                <React.Fragment key={group.label}>
                  {/* {index > 0 && <CommandSeparator />} */}
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.label}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: ComponentItem) => {
                        const Icon = item.icon;
                        return (
                          <CommandItem
                            key={item.title}
                            value={item.title}
                            onClick={() => setOpen(false)}
                            render={(props) => (
                              <Link href={item.url} {...props} />
                            )}
                          >
                            {Icon && <Icon />}
                            <span>{item.title}</span>
                            <CommandShortcut className="translate-x-2 opacity-0 transition-[translate,opacity] duration-100 ease-out group-data-[highlighted]:translate-x-0 group-data-[highlighted]:opacity-100">
                              <CornerDownLeftIcon className="size-3" />
                            </CommandShortcut>
                          </CommandItem>
                        );
                      }}
                    </CommandCollection>
                  </CommandGroup>
                </React.Fragment>
              )}
            </CommandList>
          </CommandContent>
          <CommandFooter>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Kbd size="sm" className="px-1">
                  <CornerDownLeftIcon className="size-3" />
                </Kbd>
                <span>to open</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Kbd size="sm" className="px-1">
                  <ArrowUpIcon className="size-3" />
                </Kbd>
                <Kbd size="sm" className="px-1">
                  <ArrowDownIcon className="size-3" />
                </Kbd>
                <span>to navigate</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd size="sm">esc</Kbd>
              <span>to close</span>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialog>
    </>
  );
}
