"use client";

import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/registry/default/cropper/cropper";

export default function CropperSimple() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Cropper
        className="h-80"
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
      >
        <CropperDescription />
        <CropperImage />
        <CropperCropArea />
      </Cropper>

      <p className="text-muted-foreground mt-2 text-xs">
        Simple cropper - no controls, no state
      </p>
    </div>
  );
}