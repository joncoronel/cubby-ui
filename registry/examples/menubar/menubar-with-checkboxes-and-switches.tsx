"use client";

import { useState } from "react";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarGroupLabel,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
} from "@/registry/default/menubar/menubar";

export default function MenubarWithCheckboxesAndSwitches() {
  const [bookmarks, setBookmarks] = useState(true);
  const [fullUrls, setFullUrls] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [density, setDensity] = useState("comfortable");

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarGroupLabel>Toolbars</MenubarGroupLabel>
            <MenubarCheckboxItem
              checked={bookmarks}
              onCheckedChange={setBookmarks}
            >
              Bookmarks bar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={fullUrls}
              onCheckedChange={setFullUrls}
            >
              Full URLs
            </MenubarCheckboxItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarCheckboxItem
            indicator="switch"
            checked={autoSave}
            onCheckedChange={setAutoSave}
          >
            Auto save
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Density</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={density} onValueChange={setDensity}>
            <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
            <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
            <MenubarRadioItem value="spacious">Spacious</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
