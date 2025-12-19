import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaScrollFade() {
  return (
    <div className="bg-muted/30 h-48 w-80 rounded-md border">
      <ScrollArea fadeEdges>
        <div className="space-y-4 p-4 text-sm leading-relaxed">
          <p>
            The scroll fade effect uses CSS masks to create a subtle fade at the
            edges of the scroll container. This provides a visual hint that more
            content is available.
          </p>
          <p>
            As you scroll, the fade appears and disappears based on your
            position. When at the top, only the bottom fade shows. When at the
            bottom, only the top fade shows.
          </p>
          <p>
            This approach uses Tailwind&apos;s mask utilities and works over any
            background color or pattern without needing to match colors.
          </p>
          <p>
            The fade size is set to 1.5rem by default, providing a clean
            transition that&apos;s visible but not distracting.
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
