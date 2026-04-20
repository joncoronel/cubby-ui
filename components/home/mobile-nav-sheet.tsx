"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/registry/default/sheet/sheet";
import { Button } from "@/registry/default/button/button";
import { NAV_ITEMS, GITHUB_URL } from "./top-nav";

interface MobileNavSheetProps {
  trigger: React.ReactNode;
}

export function MobileNavSheet({ trigger }: MobileNavSheetProps) {
  const [open, setOpen] = React.useState(false);
  const { setOpenSearch } = useSearchContext();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent side="right" className="sm:max-w-sm">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetBody className="flex flex-col gap-8 pt-14">
          <nav className="flex flex-col gap-5">
            {NAV_ITEMS.map((item) => (
              <SheetClose
                key={item.href}
                nativeButton={false}
                render={
                  <Link
                    href={item.href}
                    className="font-rubik text-foreground text-2xl leading-none tracking-tight"
                  >
                    {item.label}
                  </Link>
                }
              />
            ))}
          </nav>

          <div className="border-border/60 flex flex-col gap-2 border-t pt-5">
            <Button
              variant="outline"
              size="lg"
              leftSection={
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="size-4"
                  strokeWidth={2}
                />
              }
              onClick={() => {
                setOpen(false);
                setOpenSearch(true);
              }}
            >
              Search docs
            </Button>
            <Button
              variant="ghost"
              size="lg"
              leftSection={
                <HugeiconsIcon
                  icon={GithubIcon}
                  className="size-4"
                  strokeWidth={2}
                />
              }
              render={
                <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener" />
              }
              nativeButton={false}
            >
              GitHub
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
