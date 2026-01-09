import Link from "next/link";
import { Button } from "@/registry/default/button/button";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import { InteractiveCubby } from "@/components/interactive-cubby";

export default function Home() {
  return (
    <>
      {/* Dithered Logo Background */}
      <div className="dither-test bg-background pointer-events-none fixed inset-0 z-1 flex items-center justify-center overflow-hidden opacity-[0.1] dark:opacity-[0.1]">
        <CubbyUILogo className="text-foreground h-[120vh] w-[120vh] max-w-none -rotate-12 blur-lg" />
      </div>

      <div className="relative z-2 flex min-h-[calc(100vh-var(--fd-nav-height,3.5rem))] flex-col bg-transparent">
        {/* Hero section - asymmetric layout */}
        <section className="relative flex flex-1 justify-center px-6 py-16 lg:items-center lg:py-24">
          <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row lg:items-start lg:justify-between">
            {/* Content */}
            <div className="animate-fade-in-up flex max-w-xl flex-col space-y-8 opacity-0">
              <div className="space-y-5">
                <h1 className="text-foreground text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
                  Styled primitives. Your code.
                </h1>
                <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-balance">
                  Built on Base UI with Tailwind CSS 4. Copy, paste, customize.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  render={<Link href="/docs/getting-started/introduction" />}
                  variant="neutral"
                  className="transition-all duration-200 hover:shadow-md"
                  nativeButton={false}
                >
                  Get started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  render={<Link href="/docs/components/button" />}
                  className="bg-background! transition-all duration-200"
                  nativeButton={false}
                >
                  Browse components
                </Button>
              </div>

              {/* Feature pills */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 pt-4 text-sm">
                <span className="bg-muted border-border/50 rounded-full border px-3 py-1">
                  Dark mode
                </span>
                <span className="text-border/60">•</span>
                <span className="bg-muted border-border/50 rounded-full border px-3 py-1">
                  Motion
                </span>
                <span className="text-border/60">•</span>
                <span className="bg-muted border-border/50 rounded-full border px-3 py-1">
                  Accessible
                </span>
                <span className="text-border/60">•</span>
                <span className="bg-muted border-border/50 rounded-full border px-3 py-1">
                  TypeScript
                </span>
              </div>
            </div>

            {/* Visual element - interactive cubby */}
            <div
              className="animate-fade-in-up hidden opacity-0 lg:block"
              style={{ animationDelay: "0.2s" }}
            >
              <InteractiveCubby />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
