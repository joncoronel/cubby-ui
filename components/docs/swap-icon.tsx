"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// One place, two icons: each sits in the same grid cell.
const LAYER =
  "[grid-area:1/1] transition-[opacity,scale,filter] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:scale-100 motion-reduce:blur-none";
// Coming in on the label's click-feedback clock (209ms)...
const SHOWN = "opacity-100 scale-100 blur-none duration-[209ms]";
// ...and out faster (131ms), as a blend label's old text leaves.
const HIDDEN = "opacity-0 scale-90 blur-[1px] duration-[131ms]";

/**
 * Two icons swapping in place the way a blend label's text does: the one
 * showing comes into focus from 0.9 scale with a little blur, and the other
 * blurs away, on the same clock as the label beside it. An icon that
 * snapped straight to its new state read as done while the label was still
 * changing, so the label felt slow beside it.
 */
export function SwapIcon({
  swapped,
  from,
  to,
  className,
}: {
  /** Showing `to` rather than `from`. */
  swapped: boolean;
  from: React.ReactNode;
  to: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <span data-slot="swap-icon" className={cn("inline-grid", className)}>
      <span aria-hidden="true" className={cn(LAYER, swapped ? HIDDEN : SHOWN)}>
        {from}
      </span>
      <span aria-hidden="true" className={cn(LAYER, swapped ? SHOWN : HIDDEN)}>
        {to}
      </span>
    </span>
  );
}
