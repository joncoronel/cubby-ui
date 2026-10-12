"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Redo02Icon,
  TextBoldIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggle,
} from "@/registry/default/toolbar/toolbar";

const sizes = ["sm", "default", "lg"] as const;

export default function ToolbarSize() {
  return (
    <div className="flex flex-col items-center gap-4">
      {sizes.map((size) => (
        <Toolbar key={size} size={size} aria-label="Editing">
          <ToolbarButton aria-label="Undo">
            <HugeiconsIcon icon={Undo02Icon} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton aria-label="Redo">
            <HugeiconsIcon icon={Redo02Icon} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarToggle aria-label="Bold">
            <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
          </ToolbarToggle>
          <ToolbarSeparator />
          <ToolbarButton size={size}>Share</ToolbarButton>
        </Toolbar>
      ))}
    </div>
  );
}
