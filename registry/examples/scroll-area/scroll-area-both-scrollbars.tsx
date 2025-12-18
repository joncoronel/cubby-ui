import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaBothScrollbars() {
  return (
    <ScrollArea className="h-72 w-72 rounded-md border">
      <div className="grid grid-cols-[repeat(8,5rem)] grid-rows-[repeat(8,5rem)] gap-2 p-3">
        {Array.from({ length: 64 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
