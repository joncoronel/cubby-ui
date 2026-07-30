import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Separator } from "@/registry/default/separator/separator";

const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*:focus-visible]:z-10 [&>*:focus-visible]:relative [&>*[data-popup-open]]:z-10 [&>*[data-popup-open]]:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg has-[>[data-slot=button-group]]:gap-2 [&>input]:bg-card",
  {
    variants: {
      orientation: {
        // Border rules come in pairs: a root rule for children with real
        // borders (inputs, select triggers) and a `before:` twin for
        // button-recipe children, whose border lives on their paint
        // pseudo-element. The before: twins are scoped to button/a tags and
        // exclude select triggers — Tailwind's before: variant generates a
        // pseudo box on any matched element, which would otherwise add a
        // phantom flex item (and gap) inside non-recipe children. Radius
        // rules only need the root — the pseudo uses rounded-[inherit].
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>button:not(:first-child):not([data-slot=select-trigger])]:before:border-l-0 [&>a:not(:first-child)]:before:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>*:has(+[data-slot=button-group-separator])]:border-r-0 [&>button:has(+[data-slot=button-group-separator]):not([data-slot=select-trigger])]:before:border-r-0 [&>a:has(+[data-slot=button-group-separator])]:before:border-r-0 [&>button:first-of-type:not(:only-of-type)]:rounded-l-lg [&>button:first-of-type:not(:only-of-type):not([data-slot=select-trigger])]:before:border-l [&>[data-slot=select-trigger]:first-of-type:not(:only-of-type)]:border-l [&>a:first-of-type:not(:only-of-type)]:rounded-l-lg [&>a:first-of-type:not(:only-of-type)]:before:border-l [&>button:last-of-type:not(:only-of-type)]:rounded-r-lg [&>a:last-of-type:not(:only-of-type)]:rounded-r-lg",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>button:not(:first-child):not([data-slot=select-trigger])]:before:border-t-0 [&>a:not(:first-child)]:before:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>*:has(+[data-slot=button-group-separator])]:border-b-0 [&>button:has(+[data-slot=button-group-separator]):not([data-slot=select-trigger])]:before:border-b-0 [&>a:has(+[data-slot=button-group-separator])]:before:border-b-0 [&>button:first-of-type:not(:only-of-type)]:rounded-t-lg [&>button:first-of-type:not(:only-of-type):not([data-slot=select-trigger])]:before:border-t [&>[data-slot=select-trigger]:first-of-type:not(:only-of-type)]:border-t [&>a:first-of-type:not(:only-of-type)]:rounded-t-lg [&>a:first-of-type:not(:only-of-type)]:before:border-t [&>button:last-of-type:not(:only-of-type)]:rounded-b-lg [&>a:last-of-type:not(:only-of-type)]:rounded-b-lg",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-muted flex items-center gap-2 rounded-lg border bg-clip-padding px-4 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "dark:bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
