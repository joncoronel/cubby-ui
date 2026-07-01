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

// Notes/callouts authored as Markdown blockquotes. Fumadocs' default renders
// them with a left side-stripe, italic text, and auto curly-quote marks — we
// render a contained, upright callout instead. Fumadocs' prose rules use
// zero-specificity `:where()`, so plain utility classes override them cleanly.
function Blockquote({ className, ...props }: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "border-border bg-muted/60 text-foreground my-5 rounded-lg border px-4 py-3 text-sm leading-relaxed font-normal not-italic [quotes:none]",
        "*:first:mt-0 *:last:mb-0",
        className,
      )}
      {...props}
    />
  );
}

export function getMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
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
