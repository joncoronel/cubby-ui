"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Redo02Icon,
  TextBoldIcon,
  TextItalicIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggle,
} from "@/registry/default/toolbar/toolbar";

const variants = ["elevated", "outline", "soft", "ghost"] as const;

export default function ToolbarVariants() {
  return (
    <div className="flex flex-col items-center gap-4">
      {variants.map((variant) => (
        <Toolbar key={variant} variant={variant} aria-label="Editing">
          <ToolbarButton aria-label="Undo">
            <HugeiconsIcon icon={Undo02Icon} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton aria-label="Redo">
            <HugeiconsIcon icon={Redo02Icon} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarSeparator />
          <ToolbarToggle aria-label="Bold" defaultPressed>
            <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
          </ToolbarToggle>
          <ToolbarToggle aria-label="Italic">
            <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
          </ToolbarToggle>
        </Toolbar>
      ))}
    </div>
  );
}
