import { MarchingBorder } from "@/registry/default/marching-border/marching-border";

export default function MarchingBorderExplicitRadius() {
  return (
    <div className="flex w-[360px] flex-col gap-4">
      <div className="text-foreground bg-muted relative flex h-24 items-center justify-center text-sm">
        <span className="text-muted-foreground">Inherited (square)</span>
        <MarchingBorder className="text-primary" />
      </div>

      <div className="text-foreground bg-muted relative flex h-24 items-center justify-center text-sm">
        <span className="text-muted-foreground">rounded-[24px]</span>
        <MarchingBorder className="text-primary rounded-[24px]" />
      </div>
    </div>
  );
}
