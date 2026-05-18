"use client";

import * as React from "react";
import {
  TransitionPanel,
  TransitionPanelView,
} from "@/registry/default/transition-panel/transition-panel";
import { Button } from "@/registry/default/button/button";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";

const VIEWS = ["overview", "details", "summary"] as const;
type View = (typeof VIEWS)[number];

const COPY: Record<View, { title: string; body: string }> = {
  overview: {
    title: "Overview",
    body: "High-level snapshot of the workspace. Click next to drill in.",
  },
  details: {
    title: "Details",
    body: "Deeper breakdown of recent activity, with a longer block of text so the panel grows vertically when this view becomes active. The container animates its height as the content size changes between views.",
  },
  summary: {
    title: "Summary",
    body: "Compact recap before continuing.",
  },
};

export default function TransitionPanelVertical() {
  const [index, setIndex] = React.useState(0);
  const view = VIEWS[index];

  return (
    <div className="w-[360px] space-y-3">
      <div className={cn("rounded-xl p-4", solidSurface(3, 3))}>
        <TransitionPanel activeKey={view} axis="y">
          {VIEWS.map((key) => (
            <TransitionPanelView key={key} viewKey={key}>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold">{COPY[key].title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {COPY[key].body}
                </p>
              </div>
            </TransitionPanelView>
          ))}
        </TransitionPanel>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Previous
        </Button>
        <span className="text-muted-foreground text-xs tabular-nums">
          {index + 1} / {VIEWS.length}
        </span>
        <Button
          size="sm"
          onClick={() =>
            setIndex((i) => Math.min(VIEWS.length - 1, i + 1))
          }
          disabled={index === VIEWS.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
