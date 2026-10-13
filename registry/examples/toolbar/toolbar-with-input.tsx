"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";

import {
  Toolbar,
  ToolbarButton,
  ToolbarInput,
  ToolbarSeparator,
} from "@/registry/default/toolbar/toolbar";

export default function ToolbarWithInput() {
  return (
    <Toolbar variant="outline" aria-label="Files">
      <ToolbarInput
        aria-label="Search files"
        placeholder="Search files"
        className="w-40"
      />
      <ToolbarSeparator />
      <ToolbarButton aria-label="Filters">
        <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton variant="primary">New file</ToolbarButton>
    </Toolbar>
  );
}
