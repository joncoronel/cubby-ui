import Link from "next/link";
import { Button } from "@/registry/default/button/button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { CubbyUILogo } from "@/components/cubbyui-logo";
import { InteractiveCubby } from "@/components/interactive-cubby";

export default function Home() {
  return (
    <main className="bg-background relative flex min-h-screen flex-col overflow-hidden">
      {/* Dithered Logo Background */}
      <div className="dither-test bg-background pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.1] dark:opacity-[0.1]">
        <CubbyUILogo className="text-foreground h-[120vh] w-[120vh] max-w-none -rotate-12 blur-lg" />
      </div>

      {/* Minimal inline header */}
      <header className="relative z-10 px-6 pt-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
          >
            <CubbyUILogo className="h-6" />
            <span className="font-rubik text-lg font-semibold tracking-tight">
              Cubby UI
            </span>
          </Link>

          <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
            <Link
              href="/docs"
              className="hover:text-foreground transition-colors duration-200"
            >
              Documentation
            </Link>
            <Link
              href="/docs/components/button"
              className="hover:text-foreground transition-colors duration-200"
            >
              Components
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button
              render={<Link href="/docs" />}
              variant="neutral"
              className="hidden sm:flex"
              nativeButton={false}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section - asymmetric layout */}
      <section className="relative flex flex-1 justify-center px-6 py-16 lg:items-center lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          {/* Content */}
          <div className="animate-fade-in-up flex flex-col space-y-8 opacity-0">
            <div className="space-y-5">
              <h1 className="text-foreground text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
                Components that feel right at home.
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-balance">
                A thoughtfully designed collection of React components for
                building interfaces that are accessible, beautiful, and a joy to
                work with.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                render={<Link href="/docs" />}
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
                className="transition-all duration-200"
                nativeButton={false}
              >
                Browse components
              </Button>
            </div>

            {/* Feature pills */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 pt-4 text-sm">
              <span className="bg-muted/50 border-border/50 rounded-full border px-3 py-1">
                Dark mode
              </span>
              <span className="text-border/60">•</span>
              <span className="bg-muted/50 border-border/50 rounded-full border px-3 py-1">
                Motion
              </span>
              <span className="text-border/60">•</span>
              <span className="bg-muted/50 border-border/50 rounded-full border px-3 py-1">
                Accessible
              </span>
              <span className="text-border/60">•</span>
              <span className="bg-muted/50 border-border/50 rounded-full border px-3 py-1">
                TypeScript
              </span>
            </div>
          </div>

          {/* Visual element - interactive cubby */}
          <div
            className="animate-fade-in-up relative hidden opacity-0 lg:flex lg:items-start lg:justify-end"
            style={{ animationDelay: "0.2s" }}
          >
            <InteractiveCubby />
          </div>
        </div>
      </section>

      {/* <div className="pb-10" /> */}
    </main>
  );
}
