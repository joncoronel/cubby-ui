/**
 * SVG Constants for Circular Slider
 * Centralized configuration for SVG coordinates, dimensions, and styling
 */

export const SVG_VIEWBOX_SIZE = 200;
export const DEFAULT_STROKE_WIDTH = 16;

export const SVG_CONFIG = {
  VIEWBOX_SIZE: 200,
  CENTER_X: 100,
  CENTER_Y: 100,
  VIEWBOX_STRING: "0 0 200 200",
} as const;

export const RADIUS_CONFIG = {
  TRACK: 80,
  FILLED_BACKGROUND: 90,
} as const;

export const SLOT_NAMES = {
  ROOT: "circular-slider",
  TRACK: "circular-slider-track",
  INDICATOR: "circular-slider-indicator",
  THUMB: "circular-slider-thumb",
  VALUE: "circular-slider-value",
  MARKERS: "circular-slider-markers",
} as const;

export const VARIANT_COLOR_MAP = {
  track: {
    default: "stroke-border",
    filled: "stroke-transparent",
  },
  indicator: {
    default: "stroke-primary",
    filled: "stroke-transparent",
  },
} as const;
