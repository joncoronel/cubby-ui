/**
 * Easing presets for drawer animations
 * Uses smooth ease-out curves without bounce for natural feel
 */

export const EASING_PRESETS = {
  /** Fast, responsive animation for small movements */
  snappy: {
    duration: 200,
    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
  },
  /** Default animation for most drawer movements */
  smooth: {
    duration: 300,
    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
  },
  /** Slower animation for larger movements */
  relaxed: {
    duration: 400,
    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
  },
} as const;

export type EasingPreset = keyof typeof EASING_PRESETS;

/**
 * Get easing configuration for a given preset
 */
export function getEasing(preset: EasingPreset = "smooth") {
  return EASING_PRESETS[preset];
}

/**
 * CSS custom properties for drawer animations
 * These can be used in Tailwind classes or inline styles
 */
export const DRAWER_CSS_VARS = {
  duration: "--drawer-duration",
  easing: "--drawer-easing",
  translate: "--drawer-translate",
  opacity: "--drawer-opacity",
} as const;
