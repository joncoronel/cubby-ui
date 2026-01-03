import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaBothScrollbars() {
  return (
    <div className="bg-muted/30 h-72 w-72 overflow-clip rounded-md border">
      <ScrollArea>
        <div className="grid grid-cols-[repeat(8,5rem)] grid-rows-[repeat(8,5rem)] gap-2 p-3">
          {Array.from({ length: 64 }, (_, i) => (
            <div
              key={i}
              className="bg-muted text-muted-foreground flex items-center justify-center rounded-md text-sm font-medium"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
