import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaPersistScrollbar() {
  return (
    <ScrollArea
      persistScrollbar
      className="bg-muted/30 h-48 w-80 rounded-md border"
    >
      <div className="space-y-4 p-4 text-sm leading-relaxed">
        <p>
          The scrollbar is always visible, providing constant awareness of
          scroll position and content length.
        </p>
        <p>
          This is useful for interfaces where users need to quickly gauge how
          much content exists or navigate large lists efficiently.
        </p>
        <p>
          Unlike the default behavior where the scrollbar fades in on hover or
          scroll, persistent scrollbars remain visible at all times.
        </p>
      </div>
    </ScrollArea>
  );
}
