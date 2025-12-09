import { AspectRatio } from "@/registry/default/aspect-ratio/aspect-ratio";

export default function AspectRatioVideoEmbed() {
  return (
    <div className="w-full max-w-2xl">
      <AspectRatio ratio="16/9">
        <div className="w-full h-full rounded-md bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Video Placeholder (16:9)</p>
        </div>
      </AspectRatio>
    </div>
  );
}