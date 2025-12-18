import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaScrollbarGutter() {
  return (
    <div className="flex gap-4">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Without gutter</p>
        <ScrollArea className="h-48 w-56 rounded-md border">
          <div className="space-y-2 p-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md bg-muted/50 p-2"
              >
                <div className="size-6 rounded-full bg-primary/20" />
                <span className="text-sm">Item {i + 1}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">With gutter</p>
        <ScrollArea scrollbarGutter className="h-48 w-56 rounded-md border">
          <div className="space-y-2 p-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md bg-muted/50 p-2"
              >
                <div className="size-6 rounded-full bg-primary/20" />
                <span className="text-sm">Item {i + 1}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
