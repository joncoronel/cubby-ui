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

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using our service, you agree to be bound by these terms. If you do not agree to all the terms, you may not access the service.",
  },
  {
    title: "2. User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
  },
  {
    title: "3. Intellectual Property",
    body: "The service and its original content, features, and functionality are owned by us and are protected by international copyright and trademark laws.",
  },
  {
    title: "4. User Content",
    body: "You retain ownership of content you submit. By posting content, you grant us a license to use, modify, and display it in connection with the service.",
  },
  {
    title: "5. Prohibited Activities",
    body: "You may not use the service for any illegal purpose, to harass others, to distribute malware, or to interfere with the proper functioning of the service.",
  },
  {
    title: "6. Termination",
    body: "We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these terms.",
  },
  {
    title: "7. Limitation of Liability",
    body: "In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.",
  },
  {
    title: "8. Changes to Terms",
    body: "We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service.",
  },
  {
    title: "9. Governing Law",
    body: "These terms shall be governed by the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.",
  },
  {
    title: "10. Contact Information",
    body: "If you have any questions about these terms, please contact us at support@example.com.",
  },
];

export default function DialogPersistentClose() {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline">Terms of Service</Button>}
      />
      <DialogContent
        scroll="outside"
        showCloseButton={false}
        // The popup is a transparent full-width frame, not the card. That puts
        // the close button inside the focus trap while letting it sit visually
        // outside the card. `after:hidden` drops the frame's rim overlay.
        //
        // The frame's own enter/exit movement is cancelled here and re-applied
        // to the card below via `group-data-*/popup`. Otherwise the close
        // button slides and scales in along with the card, which looks wrong
        // for something pinned to the screen.
        className="group/popup pointer-events-none static flex w-full max-w-full flex-col items-center overflow-visible bg-transparent shadow-none after:hidden data-ending-style:translate-y-0 data-ending-style:scale-100 data-starting-style:translate-y-0 data-starting-style:scale-100 sm:max-w-full"
      >
        {/* Full width, so the button anchors to the corner of the screen
            rather than tracking the card. Zero-height so it adds no row.
            `top-6` matches the scroll area's own `py-6`, which is what makes
            the button pin immediately: at rest it already sits at its stuck
            position, so it never travels before catching. Hidden below `sm`,
            where the card is nearly the full width and a pinned button would
            sit on top of it. */}
        <div className="sticky top-6 z-10 hidden h-0 w-full sm:block">
          <DialogClose
            aria-label="Close"
            className="pointer-events-auto absolute end-0 top-0"
            render={<Button size="icon_sm" variant="outline" />}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </DialogClose>
        </div>

        <div
          className={cn(
            "text-popover-foreground ease-out-expo pointer-events-auto relative w-full max-w-full rounded-2xl transition-transform duration-200",
            // Cap relative to the frame, not an absolute width. `100%-6rem`
            // reserves 3rem of gutter each side, which is where the pinned
            // button lives. Widen `32rem` freely; the gutter survives, because
            // the card narrows itself before it can reach the button.
            "sm:max-w-[min(32rem,calc(100%-6rem))]",
            "group-data-ending-style/popup:translate-y-[calc(1.25rem)] group-data-ending-style/popup:scale-95",
            "group-data-starting-style/popup:translate-y-[calc(1.25rem)] group-data-starting-style/popup:scale-95",
            solidSurface(5, 5),
          )}
        >
          {/* Below `sm` the close button falls back into the card, where it
              scrolls away with the header like a normal dialog. */}
          <DialogClose
            aria-label="Close"
            className="absolute end-2 top-2 sm:hidden"
            render={<Button size="icon_sm" variant="ghost" />}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </DialogClose>

          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              The close button stays pinned while the card scrolls.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h3 className="mb-2 font-semibold">{section.title}</h3>
                <p className="text-muted-foreground text-sm">{section.body}</p>
              </section>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Decline</Button>} />
            <DialogClose render={<Button>Accept</Button>} />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
