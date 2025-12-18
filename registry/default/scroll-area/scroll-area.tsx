import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";

import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  fadeEdges = false,
  scrollbarGutter = false,
  persistScrollbar = false,
  ...props
}: BaseScrollArea.Root.Props & {
  fadeEdges?: boolean;
  scrollbarGutter?: boolean;
  persistScrollbar?: boolean;
}) {
  return (
    <BaseScrollArea.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <BaseScrollArea.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "focus-visible:ring-ring/50 size-full overscroll-contain rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:outline",
          fadeEdges && [
            "[--scroll-fade-size:1.5rem]",
            "mask-t-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-y-start,0px)))]",
            "mask-b-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-y-end,var(--scroll-fade-size))))]",
            "mask-l-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-x-start,0px)))]",
            "mask-r-from-[calc(100%-min(var(--scroll-fade-size),var(--scroll-area-overflow-x-end,var(--scroll-fade-size))))]",
          ],
          scrollbarGutter &&
            "data-has-overflow-x:pb-2.5 data-has-overflow-y:pe-2.5",
        )}
      >
        {children}
      </BaseScrollArea.Viewport>
      <ScrollBar orientation="vertical" persist={persistScrollbar} />
      <ScrollBar orientation="horizontal" persist={persistScrollbar} />
      <BaseScrollArea.Corner />
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
        className="bg-muted-foreground/25 hover:bg-muted-foreground/50 relative flex-1 rounded-full transition-colors"
      />
    </BaseScrollArea.Scrollbar>
  );
}

export { ScrollArea };
