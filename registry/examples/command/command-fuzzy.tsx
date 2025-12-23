"use client";

import * as React from "react";
import {
  Command,
  CommandCollection,
  CommandContent,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/default/command/command";
import { useFuzzyFilter } from "@/registry/default/hooks/use-fuzzy-filter";
import { highlightText } from "@/registry/default/lib/highlight-text";
import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Calculator,
  Calendar,
  CornerDownLeftIcon,
  CreditCard,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";

interface CommandItemData {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CommandGroupData {
  label: string;
  items: CommandItemData[];
}

const commandGroups: CommandGroupData[] = [
  {
    label: "Quick Actions",
    items: [
      {
        value: "new-document",
        label: "New Document",
        description: "Create a new blank document",
        icon: FileText,
      },
      {
        value: "send-message",
        label: "Send Message",
        description: "Compose and send a new message",
        icon: MessageSquare,
      },
      {
        value: "schedule-event",
        label: "Schedule Event",
        description: "Add an event to your calendar",
        icon: Calendar,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        value: "calculator",
        label: "Calculator",
        description: "Open the calculator tool",
        icon: Calculator,
      },
      {
        value: "email-client",
        label: "Email Client",
        description: "Check your inbox and emails",
        icon: Mail,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        value: "profile-settings",
        label: "Profile Settings",
        description: "Manage your profile information",
        icon: User,
      },
      {
        value: "billing-info",
        label: "Billing Information",
        description: "View and update payment methods",
        icon: CreditCard,
      },
      {
        value: "preferences",
        label: "Preferences",
        description: "Customize app settings and behavior",
        icon: Settings,
      },
    ],
  },
];

export default function CommandFuzzy() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const { filterItem } = useFuzzyFilter<CommandItemData>({
    keys: [
      { key: "label", threshold: "contains" },
      { key: "description", threshold: "word-starts-with" },
      "value",
    ],
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
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
        Press <Kbd keys={["cmd", "j"]} /> to open
      </p>
      <CommandDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <CommandDialogTrigger render={<Button>Fuzzy Search Commands</Button>} />
        <CommandDialogPopup>
          <Command
            items={commandGroups}
            filter={filterItem}
            value={query}
            onValueChange={setQuery}
            open={dialogOpen}
          >
            <CommandContent>
              <CommandInput placeholder="Search commands... (try 'calc' or 'email')" />
              <CommandList emptyMessage="No matching commands found.">
                {(group: CommandGroupData, index: number) => (
                  <React.Fragment key={group.label}>
                    {index > 0 && <CommandSeparator />}
                    <CommandGroup items={group.items}>
                      <CommandGroupLabel>{group.label}</CommandGroupLabel>
                      <CommandCollection>
                        {(item: CommandItemData) => {
                          const Icon = item.icon;
                          return (
                            <CommandItem
                              key={item.value}
                              value={item}
                              className="items-start"
                            >
                              <Icon className="mt-0.5 size-4 shrink-0" />
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium leading-5">
                                  {highlightText(item.label, query)}
                                </span>
                                <span className="text-muted-foreground text-xs leading-4">
                                  {highlightText(item.description, query)}
                                </span>
                              </div>
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
                  <span>to select</span>
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
        </CommandDialogPopup>
      </CommandDialog>
    </div>
  );
}
