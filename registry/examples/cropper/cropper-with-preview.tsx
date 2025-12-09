"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Cropper,
  CropperImage,
  CropperCropArea,
  CropperCropAreaCircular,
  CropperDescription,
  createCropCanvas,
  type Area,
} from "@/registry/default/cropper/cropper";
import { Button } from "@/registry/default/button/button";
import { Image as ImageIcon, Circle } from "lucide-react";

export default function CropperWithPreview() {
  const [aspectRatio, setAspectRatio] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isCircular, setIsCircular] = useState(false);

  const imageUrl =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop";

  const updatePreview = useCallback(
    (cropData: Area) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = createCropCanvas(img, cropData, isCircular);
          setPreviewUrl(canvas.toDataURL());
        } catch (error) {
          console.error("Preview error:", error);
        }
      };
      img.src = imageUrl;
    },
    [imageUrl, isCircular],
  );

  // Debounced crop area to reduce preview updates
  const debouncedCropArea = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    let debouncedArea: Area | null = null;

    const debounce = (area: Area | null) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (area) {
          updatePreview(area);
        }
      }, 300); // 300ms debounce delay
    };

    return { debounce, cleanup: () => clearTimeout(timeoutId) };
  }, [updatePreview]);

  useEffect(() => {
    if (cropArea) {
      debouncedCropArea.debounce(cropArea);
    }

    return () => {
      debouncedCropArea.cleanup();
    };
  }, [cropArea, debouncedCropArea]);

  const aspectRatios = [
    { label: "Square", value: 1 },
    { label: "Circle", value: 1, isCircle: true },
    { label: "Portrait", value: 3 / 4 },
    { label: "Landscape", value: 4 / 3 },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Live Preview Cropper</h3>
        <p className="text-muted-foreground text-sm">
          See your crop result update in real-time as you adjust the selection
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Original Image</h4>
            <Cropper
              image={imageUrl}
              aspectRatio={aspectRatio}
              onCropChange={setCropArea}
              className="h-64 w-full"
            >
              <CropperDescription>
                Adjust the crop area to see live preview
              </CropperDescription>
              <CropperImage />
              {isCircular ? <CropperCropAreaCircular /> : <CropperCropArea />}
            </Cropper>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <h4 className="mb-3 text-sm font-medium">Aspect Ratio</h4>
            <div className="flex gap-2">
              {aspectRatios.map((preset) => (
                <Button
                  key={preset.label}
                  variant={
                    aspectRatio === preset.value &&
                    isCircular === !!preset.isCircle
                      ? "primary"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setAspectRatio(preset.value);
                    setIsCircular(!!preset.isCircle);
                  }}
                  className="flex-1"
                >
                  {preset.isCircle && <Circle className="h-4 w-4" />}
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Crop Preview</h4>
            <div className="bg-muted flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="max-h-full max-w-full rounded object-contain"
                />
              ) : (
                <div className="text-muted-foreground space-y-2 text-center">
                  <div className="bg-muted-foreground/10 mx-auto flex h-12 w-12 items-center justify-center rounded-lg">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm">Crop preview will appear here</div>
                  <div className="text-xs">Adjust the crop area above</div>
                </div>
              )}
            </div>
          </div>

          {cropArea && (
            <div className="bg-muted space-y-2 rounded-lg p-4 text-xs">
              <div className="font-medium">Crop Details</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>
                    {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                    px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span>
                    {Math.round(cropArea.x)}, {Math.round(cropArea.y)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aspect:</span>
                  <span>
                    {aspectRatio === 0 ? "Free" : aspectRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area:</span>
                  <span>
                    {Math.round(
                      cropArea.width * cropArea.height,
                    ).toLocaleString()}
                    px²
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
