import Link from "next/link";
import { cn } from "@/lib/utils";

type ComponentType = "primitive" | "composable";

/** Convert a component slug to its display name, e.g. `dropdown-menu` → `Dropdown Menu`. */
function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Single rounded square: one styled primitive. */
function PrimitiveIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-3.5 shrink-0"
      aria-hidden
    >
      <rect x="3" y="3" width="10" height="10" rx="3" />
    </svg>
  );
}

/** Two overlapping squares: primitives composed into something new. */
function ComposableIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-3.5 shrink-0"
      aria-hidden
    >
      <rect x="2.25" y="2.25" width="8" height="8" rx="2.5" />
      <rect
        x="5.75"
        y="5.75"
        width="8"
        height="8"
        rx="2.5"
        className="fill-background"
      />
    </svg>
  );
}

const TYPE_META: Record<
  ComponentType,
  { label: string; title: string; Icon: () => React.ReactNode }
> = {
  primitive: {
    label: "Primitive",
    title: "Styled wrapper around a single Base UI primitive",
    Icon: PrimitiveIcon,
  },
  composable: {
    label: "Composable",
    title:
      "A higher-level pattern composed from primitives, or an original component",
    Icon: ComposableIcon,
  },
};

/** A quiet, inline line of classification: type, then what it's built on. */
export function ComponentTypeBadge({
  type,
  builtOn,
  className,
}: {
  type: ComponentType;
  builtOn?: string[];
  className?: string;
}) {
  const meta = TYPE_META[type];
  const hasBuiltOn = type === "composable" && builtOn && builtOn.length > 0;
  const isOriginal = type === "composable" && !hasBuiltOn;

  return (
    <p
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm",
        className,
      )}
    >
      <span className="text-foreground/85 flex items-center gap-1.5" title={meta.title}>
        <meta.Icon />
        {meta.label}
      </span>
      {hasBuiltOn && (
        <>
          <span aria-hidden="true">·</span>
          <span>built on</span>
          {builtOn!.map((slug, i) => (
            <span key={slug} className="flex items-center">
              <Link
                href={`/docs/components/${slug}`}
                className="text-foreground decoration-border hover:decoration-foreground underline underline-offset-4 transition-[text-decoration-color] duration-150"
              >
                {formatSlug(slug)}
              </Link>
              {i < builtOn!.length - 1 && <span>,</span>}
            </span>
          ))}
        </>
      )}
      {isOriginal && (
        <>
          <span aria-hidden="true">·</span>
          <span title="An original component with no Base UI counterpart">
            original, no Base UI counterpart
          </span>
        </>
      )}
    </p>
  );
}
