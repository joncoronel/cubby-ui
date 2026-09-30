import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import defaultComponents from "fumadocs-ui/mdx";
import { cn } from "@/lib/utils";
import { ComponentPreviewServer } from "@/components/mdx/component-preview-server";
import { ComponentCodeServer } from "@/components/mdx/component-code-server";
import { ComponentInstallServer } from "@/components/mdx/component-install-server";
import { ComponentUsageServer } from "@/components/mdx/component-usage-server";
import { PackageManagerCommandServer } from "@/components/mdx/package-manager-command-server";
import { MdxPreServer } from "@/components/mdx/mdx-pre-server";
import { ApiProp, ApiPropsList } from "@/components/mdx/api-prop";
import { SurfaceNestingDemo } from "@/components/mdx/surface-nesting-demo";
import { SurfaceTokensDemo } from "@/components/mdx/surface-tokens-demo";
import { SurfacePlayground } from "@/components/mdx/surface-playground";
import { DocHeading } from "@/components/docs/doc-heading";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanels,
  TabsContent,
} from "@/registry/default/tabs/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/registry/default/accordion/accordion";

// Notes authored as Markdown blockquotes render as a quiet, upright note.
function Blockquote({ className, ...props }: ComponentProps<"blockquote">) {
  return <blockquote className={cn("docs-note", className)} {...props} />;
}

// Tables scroll sideways on narrow screens instead of squeezing their columns.
function Table(props: ComponentProps<"table">) {
  return (
    <div className="docs-table">
      <table {...props} />
    </div>
  );
}

export function getMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
    h2: (props: ComponentProps<"h2">) => <DocHeading as="h2" {...props} />,
    h3: (props: ComponentProps<"h3">) => <DocHeading as="h3" {...props} />,
    h4: (props: ComponentProps<"h4">) => <DocHeading as="h4" {...props} />,
    h5: (props: ComponentProps<"h5">) => <DocHeading as="h5" {...props} />,
    h6: (props: ComponentProps<"h6">) => <DocHeading as="h6" {...props} />,
    table: Table,
    blockquote: Blockquote,
    pre: MdxPreServer as unknown as NonNullable<MDXComponents["pre"]>,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsPanels,
    TabsContent,
    ComponentPreview: ComponentPreviewServer,
    ComponentCode: ComponentCodeServer,
    ComponentInstall: ComponentInstallServer,
    ComponentUsage: ComponentUsageServer,
    PackageManagerCommand: PackageManagerCommandServer,
    ApiProp,
    ApiPropsList,
    SurfaceNestingDemo,
    SurfaceTokensDemo,
    SurfacePlayground,
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  };
}
