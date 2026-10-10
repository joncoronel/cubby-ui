"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";

const variants = ["outline", "soft", "ghost"] as const;

export default function ToggleGroupVariants() {
  return (
    <div className="flex flex-col items-center gap-4">
      {variants.map((variant) => (
        <ToggleGroup
          key={variant}
          variant={variant}
          aria-label="Text alignment"
          defaultValue={["center"]}
        >
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  );
}
