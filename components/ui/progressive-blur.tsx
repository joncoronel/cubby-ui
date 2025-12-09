"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const GRADIENT_DIRECTIONS = {
  top: "to top",
  right: "to right",
  bottom: "to bottom",
  left: "to left",
};

export type ProgressiveBlurProps = {
  direction?: keyof typeof GRADIENT_DIRECTIONS;
  blurAmount?: number;
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export const ProgressiveBlur = React.memo(function ProgressiveBlur({
  direction = "bottom",
  blurAmount = 0.25,
  backgroundColor,
  className,
  style,
  ...props
}: ProgressiveBlurProps) {
  const gradientDirection = GRADIENT_DIRECTIONS[direction];

  // Memoize blur layers to avoid recalculating on every render
  // Reduced from 9 to 7 layers for better performance while maintaining quality
  const blurLayers = React.useMemo(
    () => [
      {
        blur: 0.5 * blurAmount,
        mask: `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 8%, rgba(0, 0, 0, 1) 16%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 0) 45%)`,
      },
      {
        blur: 1 * blurAmount,
        mask: `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0) 60%)`,
      },
      {
        blur: 2 * blurAmount,
        mask: `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 75%)`,
      },
      {
        blur: 4 * blurAmount,
        mask: `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 87%)`,
      },
      {
        blur: 8 * blurAmount,
        mask: `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 65%, rgba(0, 0, 0, 1) 87%, rgba(0, 0, 0, 0) 96%)`,
      },
      {
        blur: 16 * blurAmount,
        mask: `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 65%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 1) 96%)`,
      },
      {
        blur: 32 * blurAmount,
        mask: `linear-gradient(${gradientDirection}, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 1) 100%)`,
      },
    ],
    [gradientDirection, blurAmount],
  );

  const stops = [
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
  ];

  // Create a combined mask for the background layer that covers the full blur range
  const backgroundMask = `linear-gradient(${gradientDirection} in oklch, ${stops
    .map((stop) => `oklch(0.19 0 0 / ${stop.opacity}) ${stop.offset}%`)
    .join(", ")})`;
  const backgroundMaskSimple = `linear-gradient(${gradientDirection}, transparent 0%, oklch(0 0 0) 100%)`;

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
      {/* Background layer with mask for the bg color */}
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
            maskImage: backgroundMask,
            WebkitMaskImage: backgroundMask,
            zIndex: 0,
          }}
        />
      )}
      {/* Blur layers */}

      {blurAmount > 0 &&
        blurLayers.map(
          (layer: { blur: number; mask: string }, index: number) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${layer.blur}px)`,
                WebkitBackdropFilter: `blur(${layer.blur}px)`,
                maskImage: layer.mask,
                WebkitMaskImage: layer.mask,
                zIndex: index + 1,
              }}
            />
          ),
        )}
    </div>
  );
});
