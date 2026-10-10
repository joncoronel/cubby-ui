"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  LeftToRightListBulletIcon,
} from "@hugeicons/core-free-icons";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";

export default function ToggleGroupRequired() {
  const [view, setView] = React.useState(["list"]);

  return (
    <ToggleGroup
      aria-label="View"
      value={view}
      onValueChange={(next) => {
        // Pressing the selected item would clear the group; keep it instead.
        if (next.length > 0) setView(next);
      }}
    >
      <ToggleGroupItem value="list">
        <HugeiconsIcon icon={LeftToRightListBulletIcon} strokeWidth={2} />
        List
      </ToggleGroupItem>
      <ToggleGroupItem value="grid">
        <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
        Grid
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
