"use client";

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
  CommandShortcut,
} from "@/registry/default/command/command";
import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";
import * as React from "react";
import { useState, useEffect } from "react";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowTurnBackwardIcon,
  ArrowUp01Icon,
  File01Icon,
  Folder01Icon,
  Home01Icon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
interface CommandItemData {
  value: string;
  label: string;
  icon: IconSvgElement;
  type?: string;
}

interface CommandGroupData {
  label: string;
  items: CommandItemData[];
}

const commandGroups: CommandGroupData[] = [
  {
    label: "Navigation",
    items: [
      { value: "home", label: "Home", icon: Home01Icon },
      { value: "settings", label: "Settings", icon: Settings01Icon },
      { value: "search", label: "Search", icon: Search01Icon },
    ],
  },
  {
    label: "Files",
    items: [
      {
        value: "documents",
        label: "Documents",
        icon: Folder01Icon,
        type: "Folder",
      },
      { value: "readme", label: "README.md", icon: File01Icon, type: "File" },
      { value: "package", label: "package.json", icon: File01Icon, type: "File" },
      { value: "config", label: "config.json", icon: File01Icon, type: "File" },
      {
        value: "settings",
        label: "settings.json",
        icon: File01Icon,
        type: "File",
      },
      { value: "index", label: "index.html", icon: File01Icon, type: "File" },
      { value: "style", label: "style.css", icon: File01Icon, type: "File" },
      { value: "script", label: "script.js", icon: File01Icon, type: "File" },
      { value: "image", label: "image.png", icon: File01Icon, type: "File" },
      { value: "video", label: "video.mp4", icon: File01Icon, type: "File" },
      { value: "audio", label: "audio.mp3", icon: File01Icon, type: "File" },
      { value: "pdf", label: "pdf.pdf", icon: File01Icon, type: "File" },
      { value: "word", label: "word.docx", icon: File01Icon, type: "File" },
      { value: "excel", label: "excel.xlsx", icon: File01Icon, type: "File" },
      {
        value: "powerpoint",
        label: "powerpoint.pptx",
        icon: File01Icon,
        type: "File",
      },
      { value: "zip", label: "zip.zip", icon: File01Icon, type: "File" },
      { value: "rar", label: "rar.rar", icon: File01Icon, type: "File" },
      { value: "7z", label: "7z.7z", icon: File01Icon, type: "File" },
      { value: "tar", label: "tar.tar", icon: File01Icon, type: "File" },
      { value: "gz", label: "gz.gz", icon: File01Icon, type: "File" },
    ],
  },
];

export default function CommandWithFooter() {
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
        <CommandDialogTrigger render={<Button>Open Command Menu</Button>} />
        <CommandDialogPopup>
          <Command items={commandGroups} open={dialogOpen}>
            <CommandContent>
              <CommandInput placeholder="Search for apps and commands..." />
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
                              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                              <span>{item.label}</span>
                              {item.type && (
                                <CommandShortcut>{item.type}</CommandShortcut>
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
            <CommandFooter>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Kbd size="sm" className="px-1">
                    <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-3"  strokeWidth={2} />
                  </Kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd size="sm" className="px-1">
                    <HugeiconsIcon icon={ArrowUp01Icon} className="size-3"  strokeWidth={2} />
                  </Kbd>
                  <Kbd size="sm" className="px-1">
                    <HugeiconsIcon icon={ArrowDown01Icon} className="size-3"  strokeWidth={2} />
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
