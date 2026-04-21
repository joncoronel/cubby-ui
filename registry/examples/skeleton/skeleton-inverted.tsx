import { Skeleton } from "@/registry/default/skeleton/skeleton";

export default function SkeletonInverted() {
  return (
    <div className="space-y-2">
      <Skeleton inverted className="h-4 w-[250px]" />
      <Skeleton inverted className="h-4 w-[200px]" />
    </div>
  );
}
