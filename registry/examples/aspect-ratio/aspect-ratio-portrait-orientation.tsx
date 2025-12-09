import { AspectRatio } from "@/registry/default/aspect-ratio/aspect-ratio";

export default function AspectRatioPortraitOrientation() {
  return (
    <div className="w-[250px]">
      <AspectRatio ratio="3/4">
        <img
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&dpr=2&q=80"
          alt="Portrait photograph"
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  );
}