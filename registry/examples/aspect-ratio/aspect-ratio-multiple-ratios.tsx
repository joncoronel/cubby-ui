import { AspectRatio } from "@/registry/default/aspect-ratio/aspect-ratio";

export default function AspectRatioMultipleRatios() {
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div>
        <AspectRatio ratio="1/1">
          <div className="bg-muted rounded-md w-full h-full flex items-center justify-center">
            <span className="text-sm">1:1</span>
          </div>
        </AspectRatio>
      </div>
      <div>
        <AspectRatio ratio="4/3">
          <div className="bg-muted rounded-md w-full h-full flex items-center justify-center">
            <span className="text-sm">4:3</span>
          </div>
        </AspectRatio>
      </div>
      <div>
        <AspectRatio ratio="16/9">
          <div className="bg-muted rounded-md w-full h-full flex items-center justify-center">
            <span className="text-sm">16:9</span>
          </div>
        </AspectRatio>
      </div>
    </div>
  );
}