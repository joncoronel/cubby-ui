"use client";

import * as React from "react";

/**
 * Plays every browser-run animation under `selector` at `rate`: CSS
 * transitions and keyframes, plus Motion's hardware-accelerated animations
 * (opacity, transform, filter, clip-path), which Motion hands to WAAPI.
 * Motion's JS-driven animations (layout, springs on other properties, motion
 * values) run on its own frame loop and are not affected.
 */
export function useSlowMotion(selector: string, rate: number): void {
  React.useEffect(() => {
    if (rate === 1) return;
    const touched = new Set<Animation>();
    let frame = 0;

    // New animations start every open/close, so re-check each frame.
    function tick(): void {
      for (const animation of document.getAnimations()) {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        if (!target?.closest(selector)) continue;
        if (animation.playbackRate !== rate) animation.playbackRate = rate;
        touched.add(animation);
      }
      frame = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(frame);
      for (const animation of touched) animation.playbackRate = 1;
    };
  }, [selector, rate]);
}
