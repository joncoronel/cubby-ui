"use client";

import { useState } from "react";
import {
  Cropper,
  CropperImage,
  CropperCropArea,
  CropperCropAreaCircular,
  CropperDescription,
  createCropCanvas,
  downloadCroppedImage,
  type Area,
} from "@/registry/default/cropper/cropper";
import { Button } from "@/registry/default/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectGroupLabel,
} from "@/registry/default/select/select";
import {
  Download,
  Settings,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Circle,
} from "lucide-react";

export default function CropperPro() {
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
  );
  const [fileName, setFileName] = useState("image");
  const [selectedPreset, setSelectedPreset] = useState("instagram-post");
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [customRatio, setCustomRatio] = useState(1);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [useCustomRatio, setUseCustomRatio] = useState(false);

  const socialPresets = [
    {
      id: "instagram-post",
      name: "Instagram Post",
      ratio: 1,
      size: "1080×1080",
      icon: Instagram,
      category: "Instagram",
    },
    {
      id: "instagram-story",
      name: "Instagram Story",
      ratio: 9 / 16,
      size: "1080×1920",
      icon: Instagram,
      category: "Instagram",
    },
    {
      id: "facebook-post",
      name: "Facebook Post",
      ratio: 1.91,
      size: "1200×630",
      icon: Facebook,
      category: "Facebook",
    },
    {
      id: "facebook-cover",
      name: "Facebook Cover",
      ratio: 2.7,
      size: "1640×859",
      icon: Facebook,
      category: "Facebook",
    },
    {
      id: "twitter-post",
      name: "Twitter Post",
      ratio: 16 / 9,
      size: "1200×675",
      icon: Twitter,
      category: "Twitter",
    },
    {
      id: "twitter-header",
      name: "Twitter Header",
      ratio: 3,
      size: "1500×500",
      icon: Twitter,
      category: "Twitter",
    },
    {
      id: "linkedin-post",
      name: "LinkedIn Post",
      ratio: 1.91,
      size: "1200×630",
      icon: Linkedin,
      category: "LinkedIn",
    },
    {
      id: "youtube-thumb",
      name: "YouTube Thumbnail",
      ratio: 16 / 9,
      size: "1280×720",
      icon: Youtube,
      category: "YouTube",
    },
    {
      id: "circle-crop",
      name: "Circle Crop",
      ratio: 1,
      size: "1:1 Circle",
      icon: Circle,
      category: "Custom",
      isCircle: true,
    },
    {
      id: "custom-dimensions",
      name: "Custom Dimensions",
      ratio: 1,
      size: "Custom",
      icon: Settings,
      category: "Custom",
    },
  ];

  const currentPreset = socialPresets.find((p) => p.id === selectedPreset);

  // Calculate aspect ratio based on preset or custom dimensions/ratio
  const getAspectRatio = () => {
    if (currentPreset?.isCircle || selectedPreset === "circle-crop") {
      return 1; // Always use 1:1 for perfect circles
    }
    if (selectedPreset === "custom-dimensions") {
      if (useCustomRatio) {
        return customRatio;
      } else if (useCustomSize) {
        return customWidth / customHeight;
      }
    }
    return currentPreset?.ratio || 1;
  };

  const getCurrentSize = () => {
    if (selectedPreset === "custom-dimensions") {
      if (useCustomSize) {
        return `${customWidth}×${customHeight}`;
      } else if (useCustomRatio) {
        return `Custom ${customRatio.toFixed(2)}:1`;
      }
    }
    return currentPreset?.size || "1080×1080";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name.split(".")[0]);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleDownload = async () => {
    if (cropArea && currentPreset) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const isCircle =
          currentPreset?.isCircle || selectedPreset === "circle-crop";
        const canvas = createCropCanvas(img, cropArea, isCircle);
        const timestamp = new Date().toISOString().slice(0, 10);
        const presetName = currentPreset.name
          .toLowerCase()
          .replace(/\s+/g, "-");
        downloadCroppedImage(
          canvas,
          `${fileName}-${presetName}-${timestamp}.png`,
        );
      };
      img.src = imageUrl;
    }
  };

  const categories = Array.from(new Set(socialPresets.map((p) => p.category)));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Professional Image Cropper</h3>
          <p className="text-muted-foreground text-sm">
            Upload, crop, and export for social media platforms with advanced
            controls
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-slate-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-100"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          <div className="relative">
            <Cropper
              image={imageUrl}
              aspectRatio={getAspectRatio()}
              onCropChange={setCropArea}
              className="h-96 w-full"
            >
              <CropperImage />
              {currentPreset?.isCircle || selectedPreset === "circle-crop" ? (
                <CropperCropAreaCircular />
              ) : (
                <CropperCropArea />
              )}
              <CropperDescription>
                Crop for {currentPreset?.name} - {getCurrentSize()}
              </CropperDescription>
            </Cropper>

            {currentPreset && (
              <div className="absolute top-4 left-4 rounded-lg bg-black/75 px-3 py-2 text-sm text-white backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <currentPreset.icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{currentPreset.name}</div>
                    <div className="text-xs text-white/70">
                      {getCurrentSize()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg border p-4">
            <h4 className="mb-4 text-sm font-medium">Preset Selection</h4>
            <div className="space-y-4">
              <Select
                value={selectedPreset}
                onValueChange={(value) => value && setSelectedPreset(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {currentPreset && (
                      <div className="flex items-center gap-2">
                        <currentPreset.icon className="h-4 w-4" />
                        <span>{currentPreset.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categories.map((category) => (
                    <SelectGroup key={category}>
                      <SelectGroupLabel>{category}</SelectGroupLabel>
                      {socialPresets
                        .filter((preset) => preset.category === category)
                        .map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            <div className="flex items-center gap-2">
                              <preset.icon className="h-4 w-4" />
                              <span className="font-medium">{preset.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>

              {selectedPreset === "custom-dimensions" && (
                <div className="space-y-4 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Settings className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">
                      Custom Configuration
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-xs font-medium">
                        Specific Dimensions
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            value={customWidth}
                            onChange={(e) => {
                              const newWidth = Number(e.target.value);
                              setCustomWidth(newWidth);
                              setCustomRatio(newWidth / customHeight);
                              setUseCustomSize(true);
                              setUseCustomRatio(false);
                            }}
                            placeholder="Width"
                            className="bg-background h-8 w-full rounded-md border px-2 text-xs"
                            min={100}
                            max={4000}
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={customHeight}
                            onChange={(e) => {
                              const newHeight = Number(e.target.value);
                              setCustomHeight(newHeight);
                              setCustomRatio(customWidth / newHeight);
                              setUseCustomSize(true);
                              setUseCustomRatio(false);
                            }}
                            placeholder="Height"
                            className="bg-background h-8 w-full rounded-md border px-2 text-xs"
                            min={100}
                            max={4000}
                          />
                        </div>
                      </div>
                      {useCustomSize && (
                        <div className="text-muted-foreground mt-1 text-xs">
                          {customWidth}×{customHeight} px • Ratio:{" "}
                          {customRatio.toFixed(3)}:1
                        </div>
                      )}
                    </div>

                    <div className="text-muted-foreground text-center text-xs">
                      or
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium">
                        Aspect Ratio
                      </label>
                      <input
                        type="number"
                        value={customRatio}
                        onChange={(e) => {
                          const newRatio = Number(e.target.value);
                          setCustomRatio(newRatio);
                          // Update dimensions to maintain ratio (keeping width, adjusting height)
                          setCustomHeight(Math.round(customWidth / newRatio));
                          setUseCustomRatio(true);
                          setUseCustomSize(false);
                        }}
                        placeholder="e.g. 1.5 for 3:2"
                        step={0.1}
                        min={0.1}
                        max={10}
                        className="bg-background h-8 w-full rounded-md border px-2 text-xs"
                      />
                      {useCustomRatio && (
                        <div className="text-muted-foreground mt-1 text-xs">
                          Ratio: {customRatio.toFixed(3)}:1 • Dimensions:{" "}
                          {customWidth}×{customHeight} px
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-lg border p-3">
            <h4 className="mb-3 text-sm font-medium">Export</h4>

            <div className="space-y-2">
              <Button
                onClick={handleDownload}
                disabled={!cropArea}
                size="sm"
                className="w-full"
              >
                <Download />
                Download
              </Button>

              <div className="text-muted-foreground text-center text-xs">
                {fileName}-
                {currentPreset?.name.toLowerCase().replace(/\s+/g, "-")}.png
              </div>

              {cropArea && (
                <div className="space-y-1 border-t pt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>
                      {Math.round(cropArea.width)}×{Math.round(cropArea.height)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ratio:</span>
                    <span>{getAspectRatio().toFixed(2)}</span>
                  </div>
                  {(currentPreset?.isCircle ||
                    selectedPreset === "circle-crop") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shape:</span>
                      <span>Circle</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
