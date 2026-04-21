import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, GithubIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/registry/default/button/button";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import { WorkspacePanel } from "@/components/home/workspace-panel";
import {
  CommandScene,
  FaqScene,
  FormControlsScene,
  InvoiceTableScene,
  SearchScene,
  ToastScene,
  TreeScene,
} from "@/components/home/scenes";
import { ComponentMarquee } from "@/components/home/component-marquee";
import { InstallTabs } from "@/components/home/install-tabs";

export default function Home() {
  return (
    <div className="relative">
      {/* ——————————————————————————————————— HERO + WORKSPACE (shared dither bg) */}
      <div className="relative overflow-hidden">
        {/* Dithered logo — paper texture behind the hero + workspace */}
        <div
          aria-hidden="true"
          className="dither-test bg-background pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.1] dark:opacity-[0.1]"
        >
          <CubbyUILogo className="text-foreground h-[1300px] w-[1300px] max-w-none -rotate-12 blur-lg" />
        </div>

        {/* Hero */}
        <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-16 pb-6 md:pt-24 md:pb-10">
          <div className="flex flex-col items-start gap-8 md:max-w-3xl">
          <div className="border-border/60 bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            <span className="bg-primary size-1.5 rounded-full" />
            <span>
              Built on Base UI · Tailwind CSS 4 · 60+ components
            </span>
          </div>

          <h1 className="font-rubik text-foreground text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-7xl">
            Styled primitives.
            <br />
            <span className="text-muted-foreground">Your code.</span>
          </h1>

          <p className="text-muted-foreground max-w-[55ch] text-base leading-relaxed sm:text-lg">
            A library of accessible React components built on Base UI and
            Tailwind&nbsp;CSS. Install the source into your repo and customize
            it.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Button
              variant="neutral"
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
            <Link
              href="/docs/components/button"
              className="text-foreground hover:decoration-primary underline decoration-[1.5px] decoration-dotted underline-offset-[6px] transition-colors"
            >
              or browse components
            </Link>
          </div>
        </div>
      </section>

      {/* Workspace */}
      <section
        aria-labelledby="showroom-heading"
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-4 pb-20 md:pt-8 md:pb-28"
      >
        <div className="mb-6 flex items-end justify-between gap-6 md:mb-10">
          <div className="flex max-w-xl flex-col gap-2">
            <h2
              id="showroom-heading"
              className="font-rubik text-foreground text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Try any control.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Every field below is a live Cubby UI component.
            </p>
          </div>
        </div>
        <WorkspacePanel />
      </section>
      </div>

      {/* ——————————————————————————————————— MARQUEE */}
      <ComponentMarquee />

      {/* ——————————————————————————————————— SCENE GALLERY */}
      <section
        aria-labelledby="gallery-heading"
        className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28"
      >
        <div className="mb-10 flex max-w-2xl flex-col gap-2 md:mb-14">
          <h2
            id="gallery-heading"
            className="font-rubik text-foreground text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
          >
            Examples
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Common patterns built with the library.
          </p>
        </div>

        {/* Asymmetric gallery: CSS Grid with varied row spans */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-6 md:gap-6 lg:gap-7">
          <div className="md:col-span-3 lg:col-span-3">
            <CommandScene />
          </div>
          <div className="md:col-span-3 lg:col-span-3">
            <InvoiceTableScene />
          </div>

          <div className="md:col-span-4 lg:col-span-4">
            <FormControlsScene />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <SearchScene />
          </div>

          <div className="md:col-span-3 lg:col-span-3">
            <ToastScene />
          </div>
          <div className="md:col-span-3 lg:col-span-3">
            <TreeScene />
          </div>

          <div className="md:col-span-6">
            <FaqScene />
          </div>
        </div>
      </section>

      {/* ——————————————————————————————————— INSTALL */}
      <section
        aria-labelledby="install-heading"
        className="border-border/60 border-t"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_minmax(0,32rem)] md:gap-16 md:py-28">
          <div className="flex flex-col gap-4">
            <h2
              id="install-heading"
              className="font-rubik text-foreground text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Install
            </h2>
            <p className="text-muted-foreground max-w-[48ch] text-sm leading-relaxed sm:text-base">
              Add any component with the shadcn CLI. The source lands in your
              project — no runtime, no lock-in.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                render={
                  <a
                    href="https://github.com/joncoronel/cubby-ui"
                    target="_blank"
                    rel="noreferrer noopener"
                  />
                }
                nativeButton={false}
                leftSection={
                  <HugeiconsIcon
                    icon={GithubIcon}
                    className="size-4"
                    strokeWidth={2}
                  />
                }
                rightSection={
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                }
              >
                Star on GitHub
              </Button>
            </div>
          </div>

          <div className="min-w-0">
            <InstallTabs />
          </div>
        </div>
      </section>

      {/* ——————————————————————————————————— FOOTER */}
      <footer className="border-border/60 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Cubby UI · MIT licensed</span>
          <div className="flex items-center gap-5">
            <Link
              href="/docs/getting-started/introduction"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/docs/components/button"
              className="hover:text-foreground transition-colors"
            >
              Components
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
        </div>
      </footer>
    </div>
  );
}
