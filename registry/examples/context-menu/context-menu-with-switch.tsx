"use client";

import { useState } from "react";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
} from "@/registry/default/context-menu/context-menu";

export default function ContextMenuWithSwitch() {
  const [gridLines, setGridLines] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [rulers, setRulers] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Canvas</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem
          variant="switch"
          checked={gridLines}
          onCheckedChange={setGridLines}
        >
          Grid lines
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem
          variant="switch"
          checked={snapToGrid}
          onCheckedChange={setSnapToGrid}
        >
          Snap to grid
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem
          variant="switch"
          checked={rulers}
          onCheckedChange={setRulers}
          disabled
        >
          Rulers
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
