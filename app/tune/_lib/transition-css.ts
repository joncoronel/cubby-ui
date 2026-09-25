import { spring } from "motion";
import type { EasingConfig, TransitionConfig } from "dialkit";

export type CssTiming = { duration: string; easing: string };

/**
 * DialKit's transition control returns a bezier (Easing tab) or a spring (Time
 * and Physics tabs). Springs become a `linear()` easing sampled by Motion, so
 * either one can drive a plain CSS transition.
 */
export function transitionToCss(transition: TransitionConfig): CssTiming {
  if (transition.type === "easing") {
    return {
      duration: `${transition.duration}s`,
      easing: `cubic-bezier(${transition.ease.join(",")})`,
    };
  }

  // Stringifies to "550ms linear(...)": the settle time, then the curve.
  const css = String(spring({ keyframes: [0, 1], ...transition }));
  const split = css.indexOf(" ");
  return { duration: css.slice(0, split), easing: css.slice(split + 1) };
}

/** True once a dial has left its default curve (any spring counts). */
export function isChanged(
  transition: TransitionConfig,
  base: EasingConfig,
): boolean {
  return (
    transition.type !== "easing" ||
    transition.duration !== base.duration ||
    transition.ease.some((n, i) => n !== base.ease[i])
  );
}

/** For properties that must not overshoot (opacity, size): drop springs. */
export function bezierOnly(
  transition: TransitionConfig,
  base: EasingConfig,
): EasingConfig {
  return transition.type === "easing" ? transition : base;
}

export function toMs({ duration }: CssTiming): number {
  return parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
}
