"use client";

import { useState } from "react";
import {
  Cropper,
  CropperImage,
  CropperCropArea,
  CropperDescription,
  createCropCanvas,
  downloadCroppedImage,
  type Area,
} from "@/registry/default/cropper/cropper";
import { Button } from "@/registry/default/button/button";
import { Download } from "lucide-react";

export default function CropperDownload() {
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const imageUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop";

  const handleDownload = async () => {
    if (cropArea) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = createCropCanvas(img, cropArea);
        downloadCroppedImage(canvas, 'my-crop.png');
      };
      img.src = imageUrl;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <Cropper
        image={imageUrl}
        aspectRatio={1}
        onCropChange={setCropArea}
        className="h-64"
      >
        <CropperDescription>
          Crop the image and download the result
        </CropperDescription>
        <CropperImage />
        <CropperCropArea />
      </Cropper>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Export Options</h4>
            <p className="text-xs text-muted-foreground">
              Download your cropped image as PNG
            </p>
          </div>
          <Button
            onClick={handleDownload}
            disabled={!cropArea}
            size="default"
          >
            <Download />
            Download
          </Button>
        </div>
      </div>

      {cropArea && (
        <div className="text-xs text-muted-foreground text-center">
          Ready to download: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
        </div>
      )}
    </div>
  );
}