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

/** Single rounded square — one styled primitive. */
function PrimitiveIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-3.5"
      aria-hidden
    >
      <rect x="3" y="3" width="10" height="10" rx="3" />
    </svg>
  );
}

/** Two overlapping squares — primitives composed into something new. */
function ComposableIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-3.5"
      aria-hidden
    >
      <rect x="2.25" y="2.25" width="8" height="8" rx="2.5" />
      <rect
        x="5.75"
        y="5.75"
        width="8"
        height="8"
        rx="2.5"
        className="fill-info"
      />
    </svg>
  );
}

/** Corner-down-right arrow for "built on" links. */
function BranchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground size-3"
      aria-hidden
    >
      <path d="M4 4v4.5a2 2 0 0 0 2 2h6" />
      <path d="m9.5 8 3 2.5-3 2.5" />
    </svg>
  );
}

const TYPE_META: Record<
  ComponentType,
  { label: string; title: string; badge: string; Icon: () => React.ReactNode }
> = {
  primitive: {
    label: "Primitive",
    title: "Styled wrapper around a single Base UI primitive",
    badge: "bg-secondary text-secondary-foreground border-transparent",
    Icon: PrimitiveIcon,
  },
  composable: {
    label: "Composable",
    title:
      "A higher-level pattern composed from primitives, or an original component",
    badge: "bg-info text-info-foreground border-info-border",
    Icon: ComposableIcon,
  },
};

const CHIP =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none";

export function ComponentTypeBadge({
  type,
  builtOn,
}: {
  type: ComponentType;
  builtOn?: string[];
}) {
  const meta = TYPE_META[type];
  const hasBuiltOn = type === "composable" && builtOn && builtOn.length > 0;
  const isOriginal = type === "composable" && !hasBuiltOn;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn(CHIP, meta.badge)} title={meta.title}>
        <meta.Icon />
        {meta.label}
      </span>

      {hasBuiltOn && (
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">Built on</span>
          {builtOn!.map((slug) => (
            <Link
              key={slug}
              href={`/docs/components/${slug}`}
              className={cn(
                CHIP,
                "text-foreground bg-background hover:bg-surface-hover transition-colors duration-150",
              )}
            >
              <BranchIcon />
              {formatSlug(slug)}
            </Link>
          ))}
        </span>
      )}

      {isOriginal && (
        <span
          className={cn(CHIP, "text-muted-foreground bg-background")}
          title="An original component with no Base UI counterpart"
        >
          Original
        </span>
      )}
    </div>
  );
}
