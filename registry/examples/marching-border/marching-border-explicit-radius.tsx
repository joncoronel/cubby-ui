import { MarchingBorder } from "@/registry/default/marching-border/marching-border";

export default function MarchingBorderExplicitRadius() {
  return (
    <div className="flex w-[360px] flex-col gap-4">
      <div className="text-foreground bg-muted relative flex h-24 items-center justify-center text-sm">
        <span className="text-muted-foreground">No rounded-* class</span>
        <MarchingBorder className="text-primary" radius={0} />
      </div>

      <div className="text-foreground bg-muted relative flex h-24 items-center justify-center text-sm">
        <span className="text-muted-foreground">radius=24</span>
        <MarchingBorder className="text-primary" radius={24} />
      </div>
    </div>
  );
}
