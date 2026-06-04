"use client";

import * as React from "react";
import {
  TransitionPanel,
  TransitionPanelView,
} from "@/registry/default/transition-panel/transition-panel";
import { Button } from "@/registry/default/button/button";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";

const VIEWS = ["options", "key", "phrase"] as const;
type View = (typeof VIEWS)[number];

const COPY: Record<View, { title: string; body: string }> = {
  options: {
    title: "Options",
    body: "Pick what you want to reveal. Each choice swaps the content in place with a crossfade.",
  },
  key: {
    title: "Private Key",
    body: "Your private key is the credential used to back up your wallet. Keep it secret and secure at all times. If you lose it, it cannot be recovered. This view is deliberately longer so the panel grows and you can see the height animate alongside the crossfade.",
  },
  phrase: {
    title: "Recovery Phrase",
    body: "Your recovery phrase restores your wallet. Never share it.",
  },
};

export default function TransitionPanelCrossfade() {
  const [view, setView] = React.useState<View>("options");

  return (
    <div className="w-[360px] space-y-3">
      <div className={cn("rounded-xl p-4", solidSurface(3, 3))}>
        <TransitionPanel activeKey={view} transition="fade">
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

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((key) => (
          <Button
            key={key}
            variant={key === view ? "primary" : "outline"}
            size="sm"
            onClick={() => setView(key)}
          >
            {COPY[key].title}
          </Button>
        ))}
      </div>
    </div>
  );
}
