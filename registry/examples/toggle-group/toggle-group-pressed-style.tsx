"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";

const styles = ["solid", "subtle"] as const;

export default function ToggleGroupPressedStyle() {
  return (
    <div className="flex flex-col items-center gap-4">
      {styles.map((pressedStyle) => (
        <ToggleGroup
          key={pressedStyle}
          pressedStyle={pressedStyle}
          aria-label={`Text alignment, ${pressedStyle}`}
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
