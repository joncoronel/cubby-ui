import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaNativeFade() {
  return (
    <div className="bg-muted/30 h-48 w-80 rounded-md border">
      <ScrollArea fadeEdges nativeScroll>
        <div className="space-y-4 p-4 text-sm leading-relaxed">
          <p>
            With <code>nativeScroll</code>, the fade is driven entirely by CSS
            scroll-driven animations — no JavaScript scroll listeners. The
            browser updates the mask as you scroll.
          </p>
          <p>
            The fade eases in and out over a fixed scroll distance rather than a
            percentage of the content, so the reveal feels the same whether the
            list is short or long.
          </p>
          <p>
            At the top, only the bottom edge fades to hint at more content. As
            you scroll, the top edge fades in and both edges stay soft. At the
            very end, the bottom edge sharpens again.
          </p>
          <p>
            In browsers without scroll-driven animation support, this falls back
            to a static fade on the configured edges.
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
