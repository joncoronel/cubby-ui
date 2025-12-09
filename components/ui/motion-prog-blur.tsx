"use client";
import { cn } from "@/lib/utils";
import { useMemo, memo, HTMLAttributes } from "react";

export const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
};

export type ProgressiveBlurProps = {
  direction?: keyof typeof GRADIENT_ANGLES;
  blurLayers?: number;
  className?: string;
  blurIntensity?: number;
  backgroundColor?: string;
} & HTMLAttributes<HTMLDivElement>;

// Easing stops for smooth background color transition
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

export const ProgressiveBlur = memo(function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  className,
  blurIntensity = 0.25,
  backgroundColor,
  ...props
}: ProgressiveBlurProps) {
  const layers = Math.max(blurLayers, 2);

  // Generate CSS mask for background color gradient
  const backgroundMask = useMemo(
    () =>
      `linear-gradient(to ${direction}, ${stops
        .map((stop) => `oklch(0.19 0 0 / ${stop.opacity}) ${stop.offset}%`)
        .join(", ")})`,
    [direction],
  );

  // Memoize blur layers to avoid recalculating on every render
  const blurLayersArray = useMemo(() => {
    const segmentSize = 1 / (blurLayers + 1);

    return Array.from({ length: layers }, (_, index) => {
      const angle = GRADIENT_ANGLES[direction];
      const gradientStops = [
        index * segmentSize,
        (index + 1) * segmentSize,
        (index + 2) * segmentSize,
        (index + 3) * segmentSize,
      ].map(
        (pos, posIndex) =>
          `rgba(255, 255, 255, ${posIndex === 1 || posIndex === 2 ? 1 : 0}) ${pos * 100}%`,
      );

      const gradient = `linear-gradient(${angle}deg, ${gradientStops.join(
        ", ",
      )})`;

      return {
        gradient,
        blur: index * blurIntensity,
      };
    });
  }, [layers, blurLayers, direction, blurIntensity]);

  return (
    <div className={cn("relative", className)} {...props}>
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
      {blurLayersArray.map((layer, index) => (
        <div
          key={index}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            maskImage: layer.gradient,
            WebkitMaskImage: layer.gradient,
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
          }}
        />
      ))}
    </div>
  );
});
