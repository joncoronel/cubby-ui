import { Skeleton } from "@/registry/default/skeleton/skeleton";

export default function SkeletonTable() {
  return (
    <div className="w-full">
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-[50px]" />
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-6 w-[100px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-8 w-[50px]" />
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        ))}
      </div>
    </div>
  );
}