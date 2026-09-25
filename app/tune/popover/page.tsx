"use client";

import * as React from "react";
import { useDialKit, type EasingConfig } from "dialkit";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";

// Defaults mirror registry/default/popover/popover.tsx. The dials override it
// through an unlayered <style> keyed on data-slot, which beats Tailwind's
// layered utilities without editing the component.
export default function PopoverTune(): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const v = useDialKit(
    "Popover",
    {
      keepOpen: true,
      side: { type: "select", options: ["bottom", "top", "left", "right"] },
      sideOffset: [8, 0, 24, 1],
      surface: {
        radius: [12, 0, 32, 1],
        padding: [12, 0, 32, 1],
      },
      motion: {
        enter: {
          type: "easing",
          duration: 0.1,
          ease: [0.19, 1, 0.22, 1], // --ease-out-expo
        },
        startScale: [0.95, 0.8, 1, 0.01],
      },
      replay: { type: "action" },
    },
    {
      id: "popover",
      persist: true,
      onAction: (path) => {
        if (path !== "replay") return;
        setOpen(false);
        window.setTimeout(() => setOpen(true), 400);
      },
    },
  );

  const enter = v.motion.enter as EasingConfig;
  const ease = `cubic-bezier(${enter.ease.join(",")})`;
  const size = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <style>{`
        [data-slot="popover-content"] {
          border-radius: ${v.surface.radius}px;
          transition-duration: 150ms, 150ms, ${enter.duration}s, ${enter.duration}s;
          transition-timing-function: ${size}, ${size}, ${ease}, ${ease};
        }
        [data-slot="popover-content"][data-starting-style],
        [data-slot="popover-content"][data-ending-style] {
          scale: ${v.motion.startScale};
        }
        [data-slot="popover-viewport"] {
          padding: ${v.surface.padding}px;
          --viewport-padding: ${v.surface.padding}px;
        }
      `}</style>

      <Popover
        open={open}
        onOpenChange={(next, details) => {
          // Clicking the dial panel counts as an outside press.
          if (!next && v.keepOpen && details.reason === "outside-press") return;
          setOpen(next);
        }}
      >
        <PopoverTrigger render={<Button variant="outline" />}>
          Open popover
        </PopoverTrigger>
        <PopoverContent
          side={v.side as "bottom" | "top" | "left" | "right"}
          sideOffset={v.sideOffset}
        >
          <PopoverTitle>Notifications</PopoverTitle>
          <PopoverDescription>
            You are all caught up. Good job!
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  );
}
