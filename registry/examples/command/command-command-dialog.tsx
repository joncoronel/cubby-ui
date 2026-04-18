"use client";

import {
  Command,
  CommandCollection,
  CommandContent,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/default/command/command";
import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";
import * as React from "react";
import { useState, useEffect } from "react";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  CalculatorIcon,
  Calendar01Icon,
  CreditCardIcon,
  Settings01Icon,
  SmileIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

interface CommandItemData {
  value: string;
  label: string;
  icon: IconSvgElement;
  shortcut?: string;
}

interface CommandGroupData {
  label: string;
  items: CommandItemData[];
}

const commandGroups: CommandGroupData[] = [
  {
    label: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar", icon: Calendar01Icon },
      { value: "search-emoji", label: "Search Emoji", icon: SmileIcon },
      { value: "calculator", label: "Calculator", icon: CalculatorIcon },
    ],
  },
  {
    label: "Settings",
    items: [
      { value: "profile", label: "Profile", icon: UserIcon, shortcut: "⌘P" },
      { value: "billing", label: "Billing", icon: CreditCardIcon, shortcut: "⌘B" },
      { value: "settings", label: "Settings", icon: Settings01Icon, shortcut: "⌘S" },
    ],
  },
];

export default function CommandCommandDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setDialogOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="text-center">
      <p className="text-muted-foreground mb-4 text-sm">
        Press <Kbd keys={["cmd", "k"]} /> to open
      </p>
      <CommandDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <CommandDialogTrigger
          render={<Button>Open Command Palette</Button>}
        />
        <CommandDialogPopup>
          <Command items={commandGroups} open={dialogOpen}>
            <CommandContent>
              <CommandInput placeholder="Type a command or search..." />
              <CommandList emptyMessage="No results found.">
                {(group: CommandGroupData, index: number) => (
                  <React.Fragment key={group.label}>
                    {index > 0 && <CommandSeparator />}
                    <CommandGroup items={group.items}>
                      <CommandGroupLabel>{group.label}</CommandGroupLabel>
                      <CommandCollection>
                        {(item: CommandItemData) => {
                          return (
                            <CommandItem key={item.value} value={item.value}>
                              <HugeiconsIcon
                                icon={item.icon}
                                strokeWidth={2}
                                className="mr-2 h-4 w-4"
                              />
                              <span>{item.label}</span>
                              {item.shortcut && (
                                <CommandShortcut>{item.shortcut}</CommandShortcut>
                              )}
                            </CommandItem>
                          );
                        }}
                      </CommandCollection>
                    </CommandGroup>
                  </React.Fragment>
                )}
              </CommandList>
            </CommandContent>
          </Command>
        </CommandDialogPopup>
      </CommandDialog>
    </div>
  );
}
