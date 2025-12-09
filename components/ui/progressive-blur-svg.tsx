"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const GRADIENT_DIRECTIONS = {
  top: "to top",
  right: "to right",
  bottom: "to bottom",
  left: "to left",
} as const;

// Map directions to degrees for CSS mask gradients
const MASK_DIRECTIONS = {
  top: "0deg",
  right: "90deg",
  bottom: "180deg",
  left: "270deg",
} as const;

export type ProgressiveBlurSvgProps = {
  direction?: keyof typeof GRADIENT_DIRECTIONS;
  blurAmount?: number;
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
  layers?: number; // Number of blur layers (default 8, like the example)
} & React.HTMLAttributes<HTMLDivElement>;

export const ProgressiveBlurSvg = React.memo(function ProgressiveBlurSvg({
  direction = "bottom",
  blurAmount = 0.25,
  backgroundColor,
  className,
  style,
  layers = 8,
  ...props
}: ProgressiveBlurSvgProps) {
  const gradientDirection = GRADIENT_DIRECTIONS[direction];
  const maskDirection = MASK_DIRECTIONS[direction];

  // Easing stops for smooth background color transition
  const stops = React.useMemo(
    () => [
      { offset: 0, opacity: 0 },
      { offset: 8.1, opacity: 0.013 },
      { offset: 15.5, opacity: 0.049 },
      { offset: 22.5, opacity: 0.104 },
      { offset: 29, opacity: 0.175 },
      { offset: 35.3, opacity: 0.259 },
      { offset: 41.2, opacity: 0.352 },
      { offset: 47.1, opacity: 0.45 },
      { offset: 52.9, opacity: 0.55 },
      { offset: 58.8, opacity: 0.648 },
      { offset: 64.7, opacity: 0.741 },
      { offset: 71, opacity: 0.825 },
      { offset: 77.5, opacity: 0.896 },
      { offset: 84.5, opacity: 0.951 },
      { offset: 91.9, opacity: 0.987 },
      { offset: 100, opacity: 1 },
    ],
    [],
  );

  // Generate CSS mask for background color gradient
  const backgroundMask = React.useMemo(
    () =>
      `linear-gradient(${gradientDirection}, ${stops
        .map((stop) => `oklch(0.19 0 0 / ${stop.opacity}) ${stop.offset}%`)
        .join(", ")})`,
    [gradientDirection, stops],
  );

  // Generate blur layers array with mask slices (exactly like the example you provided)
  // Each layer creates a "slice" of blur that only affects a portion of the gradient
  const blurLayers = React.useMemo(() => {
    return Array.from({ length: layers }, (_, index) => {
      const percentage = 100 / layers;
      // Each layer gets a gradient "slice" with fade in/out
      const start = index * percentage;
      const fadeIn = (index + 1) * percentage;
      const fadeOut = (index + 2) * percentage;
      const end = (index + 3) * percentage;

      return {
        blur: index * blurAmount * 2, // Progressive blur increase
        mask: `linear-gradient(${maskDirection}, transparent ${start}%, black ${fadeIn}%, black ${fadeOut}%, transparent ${end}%)`,
        zIndex: index + 1,
      };
    });
  }, [layers, blurAmount, maskDirection]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
      role="presentation"
      style={{
        contain: "layout style paint",
        ...style,
      }}
      {...props}
    >
      {/* Background layer with eased mask */}
      {backgroundColor && (
        <div
          className={cn(
            "absolute inset-0",
            backgroundColor.startsWith("bg-") && backgroundColor,
          )}
          style={{
            ...(backgroundColor.startsWith("bg-")
              ? {}
              : { backgroundColor: backgroundColor }),
            mask: backgroundMask,
            WebkitMask: backgroundMask,
            zIndex: 0,
          }}
        />
      )}

      {/* Multiple blur layers with gradient mask slices (example approach) */}
      {blurAmount > 0 &&
        blurLayers.map((layer, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              mask: layer.mask,
              WebkitMask: layer.mask,
              zIndex: layer.zIndex,
            }}
          />
        ))}
    </div>
  );
});
