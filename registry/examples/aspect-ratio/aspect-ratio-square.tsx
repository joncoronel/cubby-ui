import { AspectRatio } from "@/registry/default/aspect-ratio/aspect-ratio";

export default function AspectRatioSquare() {
  return (
    <div className="w-[300px]">
      <AspectRatio ratio="1/1">
        <img
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&dpr=2&q=80"
          alt="Square photograph"
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  );
}