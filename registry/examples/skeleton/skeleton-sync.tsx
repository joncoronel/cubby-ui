import { Skeleton } from "@/registry/default/skeleton/skeleton";

const ITEMS = ["a", "b", "c", "d", "e"];

export default function SkeletonSync() {
  return (
    <div className="grid w-full grid-cols-5 gap-4">
      {ITEMS.map((id) => (
        <div key={id} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
