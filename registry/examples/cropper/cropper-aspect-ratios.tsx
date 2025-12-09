"use client";

import { useState } from "react";
import {
  Cropper,
  CropperImage,
  CropperCropArea,
  CropperCropAreaCircular,
  CropperDescription,
  type Area,
} from "@/registry/default/cropper/cropper";
import { Button } from "@/registry/default/button/button";
import { Circle } from "lucide-react";

export default function CropperAspectRatios() {
  const [aspectRatio, setAspectRatio] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [isCircular, setIsCircular] = useState(false);

  const aspectRatios = [
    { label: "Square", value: 1 },
    { label: "Circle", value: 1, isCircle: true },
    { label: "Portrait", value: 3 / 4 },
    { label: "Landscape", value: 4 / 3 },
    { label: "Wide", value: 16 / 9 },
  ];

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <Cropper
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
        aspectRatio={aspectRatio}
        onCropChange={setCropArea}
        className="h-64"
      >
        <CropperDescription>
          Try different aspect ratio presets including circle crop
        </CropperDescription>
        <CropperImage />
        {isCircular ? <CropperCropAreaCircular /> : <CropperCropArea />}
      </Cropper>

      <div className="bg-card rounded-lg border p-4">
        <h4 className="mb-3 text-center text-sm font-medium">Aspect Ratio</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {aspectRatios.map((preset) => (
            <Button
              key={preset.label}
              variant={
                aspectRatio === preset.value && isCircular === !!preset.isCircle
                  ? "primary"
                  : "outline"
              }
              size="sm"
              onClick={() => {
                setAspectRatio(preset.value);
                setIsCircular(!!preset.isCircle);
              }}
            >
              {preset.isCircle && <Circle className="h-4 w-4" />}
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {cropArea && (
        <div className="text-muted-foreground text-center text-xs">
          Crop: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
        </div>
      )}
    </div>
  );
}
