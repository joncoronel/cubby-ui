"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CircleIcon,
  Cursor01Icon,
  PencilEdit01Icon,
  SquareIcon,
  TextIcon,
} from "@hugeicons/core-free-icons";

import {
  Toolbar,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@/registry/default/toolbar/toolbar";

const tools = [
  { value: "select", label: "Select", icon: Cursor01Icon },
  { value: "draw", label: "Draw", icon: PencilEdit01Icon },
  { value: "text", label: "Text", icon: TextIcon },
  { value: "rectangle", label: "Rectangle", icon: SquareIcon },
  { value: "ellipse", label: "Ellipse", icon: CircleIcon },
];

export default function ToolbarOrientation() {
  return (
    <Toolbar orientation="vertical" aria-label="Tools">
      <ToolbarToggleGroup aria-label="Tool" defaultValue={["select"]}>
        {tools.slice(0, 3).map((tool) => (
          <ToolbarToggle
            key={tool.value}
            value={tool.value}
            aria-label={tool.label}
          >
            <HugeiconsIcon icon={tool.icon} strokeWidth={2} />
          </ToolbarToggle>
        ))}
        <ToolbarSeparator />
        {tools.slice(3).map((tool) => (
          <ToolbarToggle
            key={tool.value}
            value={tool.value}
            aria-label={tool.label}
          >
            <HugeiconsIcon icon={tool.icon} strokeWidth={2} />
          </ToolbarToggle>
        ))}
      </ToolbarToggleGroup>
    </Toolbar>
  );
}
