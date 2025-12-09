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
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";

interface CommandItemData {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
      { value: "calendar", label: "Calendar", icon: Calendar },
      { value: "search-emoji", label: "Search Emoji", icon: Smile },
      { value: "calculator", label: "Calculator", icon: Calculator },
    ],
  },
  {
    label: "Settings",
    items: [
      { value: "profile", label: "Profile", icon: User, shortcut: "⌘P" },
      { value: "billing", label: "Billing", icon: CreditCard, shortcut: "⌘B" },
      { value: "settings", label: "Settings", icon: Settings, shortcut: "⌘S" },
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
                    const Icon = item.icon;
                    return (
                      <CommandItem key={item.value} value={item.value}>
                        <Icon className="mr-2 h-4 w-4" />
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
