import Link from "next/link";
import { findNeighbour } from "fumadocs-core/page-tree";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { source } from "@/lib/source";
import { cn } from "@/lib/utils";

type Neighbour = { name: React.ReactNode; url: string; description?: React.ReactNode };

function NeighbourLink({
  item,
  direction,
}: {
  item: Neighbour;
  direction: "previous" | "next";
}) {
  const next = direction === "next";
  const arrow = (
    <HugeiconsIcon
      icon={next ? ArrowRight02Icon : ArrowLeft02Icon}
      strokeWidth={2}
      className={cn(
        "text-muted-foreground group-hover/neighbour:text-foreground ease-out-expo size-4 shrink-0 transition-[translate,color] duration-300",
        next
          ? "group-hover/neighbour:translate-x-0.5"
          : "group-hover/neighbour:-translate-x-0.5",
      )}
    />
  );

  return (
    <Link
      href={item.url}
      aria-label={`${next ? "Next" : "Previous"}: ${typeof item.name === "string" ? item.name : ""}`}
      className={cn(
        "group/neighbour focus-visible:outline-ring/50 flex min-w-0 flex-col gap-1.5 rounded-xl py-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-4",
        next && "items-end text-right",
      )}
    >
      <span className="font-display text-foreground flex items-center gap-2 text-xl leading-tight font-semibold tracking-tight">
        {!next && arrow}
        {item.name}
        {next && arrow}
      </span>
      {item.description ? (
        <span className="text-muted-foreground line-clamp-2 max-w-[36ch] text-sm text-pretty">
          {item.description}
        </span>
      ) : null}
    </Link>
  );
}

export function PageFooter({
  url,
  githubUrl,
}: {
  url: string;
  githubUrl: string;
}) {
  const { previous, next } = findNeighbour(source.pageTree, url);

  return (
    <footer className="mt-24 flex flex-col gap-10">
      {(previous || next) && (
        <nav
          aria-label="Neighbouring pages"
          className="border-border/70 grid grid-cols-2 gap-6 border-t pt-6"
        >
          <div className="min-w-0">
            {previous && <NeighbourLink item={previous} direction="previous" />}
          </div>
          <div className="flex min-w-0 justify-end">
            {next && <NeighbourLink item={next} direction="next" />}
          </div>
        </nav>
      )}
      <p className="text-muted-foreground text-xs">
        Something off on this page?{" "}
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-foreground decoration-border hover:decoration-foreground underline underline-offset-4 transition-colors"
        >
          Edit it on GitHub
        </a>
        .
      </p>
    </footer>
  );
}
