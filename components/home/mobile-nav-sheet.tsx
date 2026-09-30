"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  GithubIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/registry/default/sheet/sheet";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, GITHUB_URL } from "./top-nav";

interface MobileNavSheetProps {
  trigger: React.ReactNode;
}

const PILL =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[0.9375rem] font-medium outline-0 outline-offset-2 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-(--land-on-field) active:scale-[0.98]";

/**
 * The landing's phone menu: a smaller slab that drops from the top, in the
 * hero's ultramarine, with the two places to go set large and the actions
 * as pills below them.
 */
export function MobileNavSheet({ trigger }: MobileNavSheetProps) {
  const [open, setOpen] = React.useState(false);
  const { setOpenSearch } = useSearchContext();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent
        side="top"
        variant="floating"
        showCloseButton={false}
        className="land-vars inset-x-2 top-2 w-auto max-w-none rounded-[1.75rem] bg-(--land-field) p-2 text-(--land-on-field)"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        <div className="flex h-12 items-center justify-between pr-1 pl-3">
          <span className="flex items-center gap-2.5">
            <CubbyUILogo className="h-5 w-auto" />
            <span className="font-(family-name:--font-display) text-[1.1rem] leading-none font-semibold tracking-tight">
              Cubby UI
            </span>
          </span>
          <SheetClose
            aria-label="Close menu"
            className="inline-flex size-10 items-center justify-center rounded-full text-(--land-on-field-muted) outline-0 outline-offset-2 outline-transparent outline-solid hover:bg-(--land-field-line) hover:text-(--land-on-field) focus-visible:outline-2 focus-visible:outline-(--land-on-field)"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="size-5"
            />
          </SheetClose>
        </div>

        <nav aria-label="Main" className="flex flex-col px-3 pt-6 pb-8">
          {NAV_ITEMS.map((item) => (
            <SheetClose
              key={item.href}
              nativeButton={false}
              render={
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-xl py-2 font-(family-name:--font-display) text-[2.25rem] leading-tight font-semibold tracking-[-0.03em] outline-0 outline-offset-2 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-(--land-on-field)"
                >
                  {item.label}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="size-6 text-(--land-on-field-muted)"
                  />
                </Link>
              }
            />
          ))}
        </nav>

        <div className="flex flex-col gap-2 p-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setOpenSearch(true);
            }}
            className={cn(PILL, "bg-(--land-on-field) text-(--land-field)")}
          >
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="size-4"
            />
            Search the docs
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              PILL,
              "text-(--land-on-field) ring-1 ring-(--land-field-line) ring-inset hover:bg-(--land-field-line)",
            )}
          >
            <HugeiconsIcon
              icon={GithubIcon}
              strokeWidth={2}
              className="size-4"
            />
            GitHub
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
