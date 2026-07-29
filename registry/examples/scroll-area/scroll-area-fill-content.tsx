import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

const items = ["Overview", "Activity", "Members", "Settings"];

function Nav({ count }: { count: number }) {
  return (
    <nav className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="hover:bg-muted/50 rounded-md px-2 py-1.5 text-sm"
        >
          {items[i % items.length]} {Math.floor(i / items.length) + 1}
        </div>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <div className="border-border mt-auto border-t pt-3">
      <div className="flex items-center gap-2 px-2">
        <div className="bg-primary/20 size-6 rounded-full" />
        <span className="text-muted-foreground text-xs">Signed in</span>
      </div>
    </div>
  );
}

export default function ScrollAreaFillContent() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">auto</p>
        <ScrollArea className="h-56 w-52 rounded-md border">
          <div className="flex flex-col p-2">
            <Nav count={3} />
            <Footer />
          </div>
        </ScrollArea>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">fill</p>
        <ScrollArea
          contentHeight="fill"
          className="h-56 w-52 rounded-md border"
        >
          <div className="flex flex-1 flex-col p-2">
            <Nav count={3} />
            <Footer />
          </div>
        </ScrollArea>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">fill, overflowing</p>
        <ScrollArea
          contentHeight="fill"
          className="h-56 w-52 rounded-md border"
        >
          <div className="flex flex-1 flex-col p-2">
            <Nav count={14} />
            <Footer />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
