"use client";

import * as React from "react";

export type ScrubPhase = "enter" | "exit";

type CssScrubOptions = {
  /** Root of the component whose transitions get frozen (children included). */
  selector: string;
  enabled: boolean;
  /** Freeze the opening transitions or the closing ones (`data-ending-style`). */
  phase: ScrubPhase;
  /** Playhead in ms, shared by every held transition so their offsets stay real. */
  time: number;
};

/**
 * Pauses CSS transitions the moment they start and seeks them to `time`, via
 * the Web Animations API (every CSS transition is a `CSSTransition` object).
 * Base UI waits on these to finish, so a frozen exit keeps the popup mounted
 * until the freeze is released.
 */
export function useCssScrub({
  selector,
  enabled,
  phase,
  time,
}: CssScrubOptions): void {
  const held = React.useRef(new Set<Animation>());
  const timeRef = React.useRef(time);

  React.useEffect(() => {
    timeRef.current = time;
    seek(held.current, time);
  }, [time]);

  React.useEffect(() => {
    if (!enabled) return;
    const animations = held.current;

    function onRun(event: TransitionEvent): void {
      const target = event.target as Element;
      const root = target.closest(selector);
      if (!root) return;
      const ending = root.hasAttribute("data-ending-style");
      if (ending !== (phase === "exit")) return;

      for (const animation of target.getAnimations()) {
        animation.pause();
        animations.add(animation);
      }
      seek(animations, timeRef.current);
    }

    document.addEventListener("transitionrun", onRun, true);
    return () => {
      document.removeEventListener("transitionrun", onRun, true);
      for (const animation of animations) animation.play();
      animations.clear();
    };
  }, [enabled, phase, selector]);
}

function seek(animations: Set<Animation>, time: number): void {
  for (const animation of animations) {
    // Interrupted transitions are cancelled and go idle; drop them.
    if (animation.playState === "idle") {
      animations.delete(animation);
      continue;
    }
    const end = Number(animation.effect?.getComputedTiming().endTime ?? 0);
    animation.currentTime = Math.min(time, end);
  }
}
