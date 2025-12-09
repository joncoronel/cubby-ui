import Link from "next/link";
import { Button } from "@/registry/default/button/button";
import { CubbyUILogo } from "@/components/cubbyui-logo";

export default function NotFound() {
  return (
    <main className="bg-background relative flex min-h-screen flex-col overflow-hidden">
      {/* Dithered Logo Background - same as landing page */}
      <div className="dither-test bg-background pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.08] dark:opacity-[0.08]">
        <CubbyUILogo className="text-foreground h-[140vh] w-[140vh] max-w-none rotate-6 blur-lg" />
      </div>

      {/* Minimal header */}
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
        </div>
      </header>

      {/* Main content */}
      <section className="relative flex flex-1 items-center justify-center px-6 py-16">
        <div className="animate-fade-in-up mx-auto flex max-w-2xl flex-col items-center text-center opacity-0">
          {/* 404 number */}
          <div className="relative mb-6">
            <span className="font-rubik text-muted-foreground/20 text-[12rem] leading-none font-bold tracking-tighter sm:text-[16rem]">
              404
            </span>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Page not found
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed text-balance">
              The page you&apos;re looking for doesn&apos;t exist or may have
              been moved.
            </p>
          </div>

          {/* Actions */}
          <div
            className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-3 opacity-0"
            style={{ animationDelay: "0.15s" }}
          >
            <Button
              render={<Link href="/" />}
              variant="neutral"
              className="transition-all duration-200 hover:shadow-md"
              nativeButton={false}
            >
              Back to home
            </Button>
            <Button
              variant="outline"
              render={<Link href="/docs" />}
              className="transition-all duration-200"
              nativeButton={false}
            >
              Browse docs
            </Button>
          </div>

          {/* Subtle error code */}
          <div
            className="animate-fade-in-up text-muted-foreground/40 mt-16 font-mono text-xs tracking-wider opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            ERR_NOT_FOUND
          </div>
        </div>
      </section>
    </main>
  );
}
