"use client";

import * as React from "react";
import {
  Command,
  CommandCollection,
  CommandContent,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/default/command/command";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CalculatorIcon,
  Calendar01Icon,
  CreditCardIcon,
  Settings01Icon,
  SmileIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

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

export default function CommandBasicCommandMenu() {
  return (
    <Command className="mx-auto max-w-md" items={commandGroups}>
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
  );
}
