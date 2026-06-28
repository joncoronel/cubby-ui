export default function ScrollFadeDemo() {
  return (
    <div className="bg-muted/30 h-48 w-80 rounded-md border">
      <div className="scroll-fade h-full overflow-y-auto">
        <div className="space-y-4 p-4 text-sm leading-relaxed">
          <p>
            The <code>scroll-fade</code> utility works on any scroll container —
            no component required. Add it to the element that has{" "}
            <code>overflow-y-auto</code> and the edges dissolve as you scroll.
          </p>
          <p>
            It is driven by CSS scroll-driven animations, so the fade tracks the
            scroll position with no JavaScript. At the top only the bottom edge
            fades; mid-scroll both edges soften; at the end the bottom sharpens.
          </p>
          <p>
            Because it masks the content itself, it adapts to any background
            without configuration. Use <code>scroll-fade-x</code> for horizontal
            scrollers and <code>scroll-fade-none</code> to switch it off
            responsively.
          </p>
          <p>
            In browsers without scroll-driven animation support, it falls back
            to a static fade on both edges.
          </p>
        </div>
      </div>
    </div>
  );
}
