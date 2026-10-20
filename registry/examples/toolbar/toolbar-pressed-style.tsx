"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextBoldIcon,
  TextItalicIcon,
} from "@hugeicons/core-free-icons";

import {
  Toolbar,
  ToolbarSeparator,
  ToolbarToggle,
} from "@/registry/default/toolbar/toolbar";

const styles = ["subtle", "solid"] as const;

export default function ToolbarPressedStyle() {
  return (
    <div className="flex flex-col items-center gap-4">
      {styles.map((pressedStyle) => (
        <Toolbar
          key={pressedStyle}
          pressedStyle={pressedStyle}
          aria-label={`Formatting, ${pressedStyle}`}
        >
          <ToolbarToggle aria-label="Bold" defaultPressed>
            <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
          </ToolbarToggle>
          <ToolbarToggle aria-label="Italic" defaultPressed>
            <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
          </ToolbarToggle>
          <ToolbarSeparator />
          <ToolbarToggle aria-label="Align left" defaultPressed>
            <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} />
          </ToolbarToggle>
          <ToolbarToggle aria-label="Align center">
            <HugeiconsIcon icon={TextAlignCenterIcon} strokeWidth={2} />
          </ToolbarToggle>
        </Toolbar>
      ))}
    </div>
  );
}
