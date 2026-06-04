import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/registry/default/button/button";
import { CategoryTiles } from "@/components/home/category-tiles";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-5xl flex-col px-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-12 py-10 text-center md:gap-14 md:py-12">
        {/* Hero statement */}
        <div className="flex flex-col items-center gap-6">
          <span
            className="home-reveal border-border/70 bg-card/60 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
          >
            <span className="bg-primary size-1.5 rounded-full" />
            Built on Base UI · Tailwind CSS 4
          </span>

          <h1
            className="home-reveal text-foreground font-(family-name:--font-display) max-w-[18ch] text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl"
            style={{ ["--reveal-delay" as string]: "80ms" }}
          >
            Beautiful components, yours to own.
          </h1>

          <p
            className="home-reveal text-muted-foreground max-w-[58ch] text-lg leading-relaxed text-pretty"
            style={{ ["--reveal-delay" as string]: "160ms" }}
          >
            Sixty-plus accessible React components built on Base UI and Tailwind.
            Install the source into your project and own every line.
          </p>

          <div
            className="home-reveal mt-1 flex flex-wrap items-center justify-center gap-3"
            style={{ ["--reveal-delay" as string]: "240ms" }}
          >
            <Button
              variant="primary"
              size="lg"
              render={<Link href="/docs/getting-started/introduction" />}
              nativeButton={false}
              rightSection={
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4"
                  strokeWidth={2}
                />
              }
            >
              Get started
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/docs/components/button" />}
              nativeButton={false}
            >
              Browse components
            </Button>
          </div>
        </div>

        {/* Browse entry points — abstract illustrations, not live demos */}
        <CategoryTiles />
      </div>

      {/* Minimal footer, pinned to the bottom of the screen */}
      <footer className="text-muted-foreground flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
        <span>© {new Date().getFullYear()} Cubby UI · MIT licensed</span>
        <div className="flex items-center gap-5">
          <Link
            href="/docs/getting-started/introduction"
            className="hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/docs/hooks/use-fuzzy-filter"
            className="hover:text-foreground transition-colors"
          >
            Hooks
          </Link>
          <a
            href="https://github.com/joncoronel/cubby-ui"
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
