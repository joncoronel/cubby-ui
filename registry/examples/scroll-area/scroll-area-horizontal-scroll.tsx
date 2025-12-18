import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaHorizontalScroll() {
  return (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex h-20 w-32 items-center justify-center rounded-md bg-secondary"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}