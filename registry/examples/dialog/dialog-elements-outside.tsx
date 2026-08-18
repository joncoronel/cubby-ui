"use client";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

const CAPTIONS = [
  {
    title: "Capture",
    body: "Shot on a 35mm lens at f/1.8. The shallow depth of field keeps the subject separated from a busy background.",
  },
  {
    title: "Processing",
    body: "Exposure lifted half a stop, highlights pulled back, and a gentle curve applied to keep the midtones from flattening.",
  },
  {
    title: "Colour",
    body: "Warmed slightly overall, with the greens desaturated so they stop competing with the skin tones.",
  },
  {
    title: "Cropping",
    body: "Trimmed to a 16:9 frame. The original had more headroom than the composition needed.",
  },
  {
    title: "Usage",
    body: "Licensed for editorial use. Attribution is required for anything published outside the original article.",
  },
  {
    title: "Export",
    body: "Delivered as a 3000px JPEG at quality 90, plus a lossless original for anyone who needs to re-crop it later.",
  },
  {
    title: "Alt text",
    body: "Written to describe the action rather than the frame, so it still makes sense when read out on its own.",
  },
  {
    title: "Archive",
    body: "Stored with the shoot's contact sheet. The raw file stays on cold storage for two years before review.",
  },
];

export default function DialogElementsOutside() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>View Image</Button>} />

      <DialogContent
        // The popup is just a transparent layout frame; the card below carries
        // the surface. `shadow-none` drops the frame's drop shadow and
        // `after:hidden` removes the rim overlay `elevatedSurface()` adds.
        // `pt-7` reserves a strip above the card for the close button. Below
        // `sm` the card spans the full width, so there is no side gutter and
        // the button would otherwise sit on the card's own header. From `sm`
        // up the card is `max-w-lg` and the button clears it horizontally, so
        // the strip is dropped and the button sits level with the card top.
        className="group/popup pointer-events-none static flex h-full max-h-full w-full items-center justify-center overflow-visible bg-transparent pt-7 shadow-none after:hidden data-ending-style:translate-y-0 data-ending-style:scale-100 data-starting-style:translate-y-0 data-starting-style:scale-100 sm:max-w-full sm:pt-0"
        showCloseButton={false}
      >
        {/* Close button positioned OUTSIDE the card visually. `outline` gives
            it a fill and a border so it reads against the backdrop; a ghost
            button would rely on contrast the backdrop does not provide.
            `-top-4` lifts it into the viewport's own padding on mobile, so the
            strip above the card is used rather than added to. */}
        <DialogClose
          aria-label="Close"
          // `right-0`, not an inset: below `sm` the card fills the frame, so
          // the frame's right edge IS the card's right edge and any inset
          // would misalign the two.
          className="pointer-events-auto absolute -top-4 right-0 sm:top-0"
          render={<Button size="icon_sm" variant="outline" />}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </DialogClose>
        {/* The actual popup card — uses the same elevation as a default Dialog */}
        <div
          className={cn(
            // `flex max-h-full min-h-0 flex-col` is what lets DialogBody
            // scroll: without a height cap on the card its `flex-1` has
            // nothing to resolve against and the card just grows instead.
            "text-popover-foreground ease-out-expo pointer-events-auto flex max-h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-2xl transition-transform duration-200 group-data-ending-style/popup:translate-y-[calc(1.25rem)] group-data-ending-style/popup:scale-95 group-data-starting-style/popup:translate-y-[calc(1.25rem)] group-data-starting-style/popup:scale-95",
            // The width cap is relative to the frame, not absolute. `100%-6rem`
            // reserves 3rem of gutter on each side for the close button, so the
            // button can never land on the card no matter how wide the cap or
            // the viewport gets. Change `32rem` freely; the gutter survives.
            "sm:max-w-[min(32rem,calc(100%-6rem))]",
            solidSurface(5, 5),
          )}
        >
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>
              The close button appears outside the card but remains in the tab
              order.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
              <span className="text-muted-foreground text-sm">
                Image placeholder
              </span>
            </div>
            {CAPTIONS.map((caption) => (
              <section key={caption.title}>
                <h3 className="mb-1 text-sm font-semibold">{caption.title}</h3>
                <p className="text-muted-foreground text-sm">{caption.body}</p>
              </section>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Done</Button>} />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
