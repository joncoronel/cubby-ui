import { AspectRatio } from "@/registry/default/aspect-ratio/aspect-ratio";

export default function AspectRatio16_9String() {
  return (
    <div className="w-[450px]">
      <AspectRatio ratio="16/9">
        <img
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&dpr=2&q=80"
          alt="Landscape photograph"
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  );
}