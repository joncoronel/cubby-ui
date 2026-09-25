import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type DocHeadingProps = ComponentProps<"h2"> & { as: HeadingTag };

/** MDX heading with a hover anchor that hangs in the left margin. */
export function DocHeading({
  as: Tag,
  id,
  className,
  children,
  ...props
}: DocHeadingProps): ReactElement {
  if (!id) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={cn("docs-heading group/heading", className)} {...props}>
      <a href={`#${id}`} className="docs-heading-link">
        {children}
        <span aria-hidden="true" className="docs-heading-hash">
          #
        </span>
      </a>
    </Tag>
  );
}
