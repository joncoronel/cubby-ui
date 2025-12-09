"use client";

import { Cropper as CropperPrimitive } from "@origin-space/image-cropper";
import { forwardRef, useCallback, useRef, useState } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Crop,
  Square,
  Smartphone,
  Monitor
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropData {
  cropArea: Area;
  zoom: number;
  aspectRatio: number;
}

type AspectRatioPreset = {
  label: string;
  value: number;
  icon?: React.ComponentType<{ className?: string }>;
};

const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  { label: "Free", value: 0 },
  { label: "Square", value: 1, icon: Square },
  { label: "Portrait", value: 3/4, icon: Smartphone },
  { label: "Landscape", value: 4/3, icon: Monitor },
  { label: "Widescreen", value: 16/9, icon: Monitor },
];

const createCropCanvas = (image: HTMLImageElement, cropArea: Area, isCircular: boolean = false): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to get canvas context');
  
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  
  if (isCircular) {
    // Create circular clipping path
    const centerX = cropArea.width / 2;
    const centerY = cropArea.height / 2;
    const radius = Math.min(centerX, centerY);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.clip();
  }
  
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );
  
  return canvas;
};

const downloadCroppedImage = (canvas: HTMLCanvasElement, filename: string = 'cropped-image.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
};

const getCroppedImageBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    });
  });
};

function Cropper({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.Root>) {
  return (
    <CropperPrimitive.Root
      data-slot="cropper"
      className={cn(
        "relative flex w-full cursor-move touch-none items-center justify-center overflow-hidden focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CropperDescription({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.Description>) {
  return (
    <CropperPrimitive.Description
      data-slot="cropper-description"
      className={cn("sr-only", className)}
      {...props}
    />
  );
}

function CropperImage({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.Image>) {
  return (
    <CropperPrimitive.Image
      data-slot="cropper-image"
      className={cn(
        "pointer-events-none h-full w-full object-cover",
        className,
      )}
      {...props}
    />
  );
}

function CropperCropArea({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.CropArea>) {
  return (
    <CropperPrimitive.CropArea
      data-slot="cropper-crop-area"
      className={cn(
        "pointer-events-none absolute border-3 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] in-[[data-slot=cropper]:focus-visible]:ring-[3px] in-[[data-slot=cropper]:focus-visible]:ring-white/50",
        className,
      )}
      {...props}
    />
  );
}

function CropperCropAreaCircular({
  className,
  ...props
}: React.ComponentProps<typeof CropperPrimitive.CropArea>) {
  return (
    <CropperPrimitive.CropArea
      data-slot="cropper-crop-area"
      className={cn(
        "pointer-events-none absolute border-3 border-white rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] in-[[data-slot=cropper]:focus-visible]:ring-[3px] in-[[data-slot=cropper]:focus-visible]:ring-white/50",
        className,
      )}
      {...props}
    />
  );
}

const CropperControls = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_2px_8px_0_oklch(0.18_0_0_/_0.06)]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CropperControls.displayName = "CropperControls";

const CropperZoomControls = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
    onZoomChange: (zoom: number) => void;
    onReset?: () => void;
    step?: number;
  }
>(({ 
  className, 
  zoom, 
  minZoom = 1, 
  maxZoom = 3, 
  onZoomChange, 
  onReset,
  step = 0.1,
  ...props 
}, ref) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(maxZoom, zoom + step));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(minZoom, zoom - step));
  };

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      <button
        type="button"
        onClick={handleZoomOut}
        disabled={zoom <= minZoom}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input/60 bg-background text-sm font-medium ring-offset-background transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      
      <span className="min-w-[3rem] text-center text-sm text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      
      <button
        type="button"
        onClick={handleZoomIn}
        disabled={zoom >= maxZoom}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input/60 bg-background text-sm font-medium ring-offset-background transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input/60 bg-background text-sm font-medium ring-offset-background transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
CropperZoomControls.displayName = "CropperZoomControls";

const CropperAspectRatioControls = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    aspectRatio: number;
    onAspectRatioChange: (ratio: number) => void;
    presets?: AspectRatioPreset[];
  }
>(({ 
  className, 
  aspectRatio, 
  onAspectRatioChange, 
  presets = ASPECT_RATIO_PRESETS,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1", className)}
    {...props}
  >
    {presets.map((preset) => {
      const Icon = preset.icon;
      const isActive = aspectRatio === preset.value;
      
      return (
        <button
          key={preset.label}
          type="button"
          onClick={() => onAspectRatioChange(preset.value)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isActive
              ? "border-primary bg-primary text-primary-foreground shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.08)]"
              : "border-input/60 bg-background hover:bg-accent/80 hover:text-accent-foreground"
          )}
          aria-label={`Set aspect ratio to ${preset.label}`}
        >
          {Icon && <Icon className="h-3 w-3" />}
          {preset.label}
        </button>
      );
    })}
  </div>
));
CropperAspectRatioControls.displayName = "CropperAspectRatioControls";

const CropperInfo = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cropData?: CropData;
    showDetails?: boolean;
  }
>(({ className, cropData, showDetails = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1 text-xs text-muted-foreground", className)}
    {...props}
  >
    {cropData && (
      <>
        <div className="flex items-center justify-between">
          <span>Zoom:</span>
          <span>{Math.round(cropData.zoom * 100)}%</span>
        </div>
        {showDetails && (
          <>
            <div className="flex items-center justify-between">
              <span>Aspect:</span>
              <span>{cropData.aspectRatio === 0 ? "Free" : cropData.aspectRatio.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Size:</span>
              <span>{Math.round(cropData.cropArea.width)} × {Math.round(cropData.cropArea.height)}</span>
            </div>
          </>
        )}
      </>
    )}
  </div>
));
CropperInfo.displayName = "CropperInfo";

const CropperActions = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onDownload?: () => void;
    onExport?: () => void;
    downloadLabel?: string;
    exportLabel?: string;
  }
>(({ 
  className, 
  onDownload, 
  onExport, 
  downloadLabel = "Download",
  exportLabel = "Export",
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    {onDownload && (
      <button
        type="button"
        onClick={onDownload}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input/60 bg-background px-3 text-xs font-medium ring-offset-background transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Download className="h-3 w-3" />
        {downloadLabel}
      </button>
    )}
    {onExport && (
      <button
        type="button"
        onClick={onExport}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input/60 bg-background px-3 text-xs font-medium ring-offset-background transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Crop className="h-3 w-3" />
        {exportLabel}
      </button>
    )}
  </div>
));
CropperActions.displayName = "CropperActions";

interface UseCropperOptions {
  initialZoom?: number;
  initialAspectRatio?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

const useCropper = (options: UseCropperOptions = {}) => {
  const {
    initialZoom = 1,
    initialAspectRatio = 1,
    minZoom = 1,
    maxZoom = 3,
    zoomStep = 0.1,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [cropData, setCropData] = useState<CropData | undefined>();

  const zoomRef = useRef(zoom);
  const aspectRatioRef = useRef(aspectRatio);
  
  // Update refs when state changes
  zoomRef.current = zoom;
  aspectRatioRef.current = aspectRatio;

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.max(minZoom, Math.min(maxZoom, newZoom)));
  }, [minZoom, maxZoom]);

  const handleAspectRatioChange = useCallback((newRatio: number) => {
    setAspectRatio(newRatio);
  }, []);

  const handleCropChange = useCallback((cropArea: Area | null) => {
    if (cropArea) {
      setCropData({
        cropArea,
        zoom: zoomRef.current,
        aspectRatio: aspectRatioRef.current,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setZoom(initialZoom);
    setAspectRatio(initialAspectRatio);
  }, [initialZoom, initialAspectRatio]);

  const exportCrop = useCallback(async (imageElement: HTMLImageElement, filename?: string) => {
    if (!cropData) return null;
    
    const canvas = createCropCanvas(imageElement, cropData.cropArea);
    
    if (filename) {
      downloadCroppedImage(canvas, filename);
    }
    
    return {
      canvas,
      blob: await getCroppedImageBlob(canvas),
      dataUrl: canvas.toDataURL(),
    };
  }, [cropData]);

  return {
    zoom,
    aspectRatio,
    cropData,
    setZoom: handleZoomChange,
    setAspectRatio: handleAspectRatioChange,
    onCropChange: handleCropChange,
    reset,
    exportCrop,
    config: {
      minZoom,
      maxZoom,
      zoomStep,
    },
  };
};

export { 
  Cropper, 
  CropperDescription, 
  CropperImage, 
  CropperCropArea,
  CropperCropAreaCircular,
  CropperControls,
  CropperZoomControls,
  CropperAspectRatioControls,
  CropperInfo,
  CropperActions,
  useCropper,
  createCropCanvas,
  downloadCroppedImage,
  getCroppedImageBlob,
  ASPECT_RATIO_PRESETS,
  type Area,
  type CropData,
  type AspectRatioPreset,
};
