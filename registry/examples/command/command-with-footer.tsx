"use client";

import {
  Command,
  CommandCollection,
  CommandContent,
  CommandDialog,
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
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CornerDownLeftIcon,
  FileIcon,
  FolderIcon,
  HomeIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import * as React from "react";
import { useState, useEffect } from "react";

interface CommandItemData {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
      { value: "home", label: "Home", icon: HomeIcon },
      { value: "settings", label: "Settings", icon: SettingsIcon },
      { value: "search", label: "Search", icon: SearchIcon },
    ],
  },
  {
    label: "Files",
    items: [
      {
        value: "documents",
        label: "Documents",
        icon: FolderIcon,
        type: "Folder",
      },
      { value: "readme", label: "README.md", icon: FileIcon, type: "File" },
      { value: "package", label: "package.json", icon: FileIcon, type: "File" },
      { value: "config", label: "config.json", icon: FileIcon, type: "File" },
      {
        value: "settings",
        label: "settings.json",
        icon: FileIcon,
        type: "File",
      },
      { value: "index", label: "index.html", icon: FileIcon, type: "File" },
      { value: "style", label: "style.css", icon: FileIcon, type: "File" },
      { value: "script", label: "script.js", icon: FileIcon, type: "File" },
      { value: "image", label: "image.png", icon: FileIcon, type: "File" },
      { value: "video", label: "video.mp4", icon: FileIcon, type: "File" },
      { value: "audio", label: "audio.mp3", icon: FileIcon, type: "File" },
      { value: "pdf", label: "pdf.pdf", icon: FileIcon, type: "File" },
      { value: "word", label: "word.docx", icon: FileIcon, type: "File" },
      { value: "excel", label: "excel.xlsx", icon: FileIcon, type: "File" },
      {
        value: "powerpoint",
        label: "powerpoint.pptx",
        icon: FileIcon,
        type: "File",
      },
      { value: "zip", label: "zip.zip", icon: FileIcon, type: "File" },
      { value: "rar", label: "rar.rar", icon: FileIcon, type: "File" },
      { value: "7z", label: "7z.7z", icon: FileIcon, type: "File" },
      { value: "tar", label: "tar.tar", icon: FileIcon, type: "File" },
      { value: "gz", label: "gz.gz", icon: FileIcon, type: "File" },
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
      <Button onClick={() => setDialogOpen(true)}>Open Command Menu</Button>
      <CommandDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                        const Icon = item.icon;
                        return (
                          <CommandItem key={item.value} value={item.value}>
                            <Icon />
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
      </CommandDialog>
    </div>
  );
}
