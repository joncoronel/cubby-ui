import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";

import { cn } from "@/lib/utils";

type FadeEdge = "top" | "bottom" | "left" | "right" | "x" | "y";
type FadeEdges = boolean | FadeEdge | FadeEdge[];

function parseFadeEdges(fadeEdges: FadeEdges): {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
} {
  if (fadeEdges === true) {
    return { top: true, bottom: true, left: true, right: true };
  }
  if (fadeEdges === false) {
    return { top: false, bottom: false, left: false, right: false };
  }

  const edges = Array.isArray(fadeEdges) ? fadeEdges : [fadeEdges];
  const result = { top: false, bottom: false, left: false, right: false };

  for (const edge of edges) {
    if (edge === "x") {
      result.left = true;
      result.right = true;
    } else if (edge === "y") {
      result.top = true;
      result.bottom = true;
    } else {
      result[edge] = true;
    }
  }

  return result;
}

interface ScrollAreaProps extends BaseScrollArea.Root.Props {
  fadeEdges?: FadeEdges;
  scrollbarGutter?: boolean;
  persistScrollbar?: boolean;
  hideScrollbar?: boolean;
}

function ScrollArea({
  className,
  children,
  fadeEdges = false,
  scrollbarGutter = false,
  persistScrollbar = false,
  hideScrollbar = false,
  ...props
}: ScrollAreaProps) {
  if (process.env.NODE_ENV !== "production") {
    if (persistScrollbar && hideScrollbar) {
      console.error(
        "ScrollArea: `persistScrollbar` and `hideScrollbar` cannot be used together.",
      );
    }
  }

  const fade = parseFadeEdges(fadeEdges);
  const hasFade = fade.top || fade.bottom || fade.left || fade.right;

  return (
    <BaseScrollArea.Root
      data-slot="scroll-area"
      className={cn("flex size-full min-h-0 flex-col", className)}
      {...props}
    >
      <BaseScrollArea.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "h-full overscroll-contain rounded-[inherit]",
          "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
          hasFade && "[--scroll-fade-size:1.5rem]",
          fade.top &&
            "mask-t-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-y-start,0px)))]",
          fade.bottom &&
            "mask-b-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-y-end,var(--scroll-fade-size))))]",
          fade.left &&
            "mask-l-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-x-start,0px)))]",
          fade.right &&
            "mask-r-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-x-end,var(--scroll-fade-size))))]",
          scrollbarGutter &&
            "data-has-overflow-x:pb-2.5 data-has-overflow-y:pe-2.5",
        )}
      >
        {children}
      </BaseScrollArea.Viewport>
      {!hideScrollbar && (
        <>
          <ScrollBar orientation="vertical" persist={persistScrollbar} />
          <ScrollBar orientation="horizontal" persist={persistScrollbar} />
          <BaseScrollArea.Corner />
        </>
      )}
    </BaseScrollArea.Root>
  );
}

function ScrollBar({
  className,
  persist = false,
  ...props
}: BaseScrollArea.Scrollbar.Props & { persist?: boolean }) {
  return (
    <BaseScrollArea.Scrollbar
      data-slot="scroll-area-scrollbar"
      className={cn(
        "m-1 flex select-none",
        !persist &&
          "opacity-0 transition-opacity delay-200 data-hovering:opacity-100 data-hovering:delay-0 data-hovering:duration-100 data-scrolling:opacity-100 data-scrolling:delay-0 data-scrolling:duration-100",
        "data-[orientation=vertical]:w-1.5",
        "data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    >
      <BaseScrollArea.Thumb
        data-slot="scroll-area-thumb"
        className="bg-muted-foreground/20 relative flex-1 rounded-full"
      />
    </BaseScrollArea.Scrollbar>
  );
}

export { ScrollArea };
export type { ScrollAreaProps, FadeEdges, FadeEdge };
