import type { MDXComponents } from "mdx/types";
import defaultComponents from "fumadocs-ui/mdx";
import { ComponentPreviewServer } from "@/components/mdx/component-preview-server";
import { ComponentCodeServer } from "@/components/mdx/component-code-server";
import { ComponentInstallServer } from "@/components/mdx/component-install-server";
import { ComponentUsageServer } from "@/components/mdx/component-usage-server";
import { MdxCodeBlockServer } from "@/components/mdx/mdx-code-block-server";
// import { MdxPre } from "@/components/mdx/mdx-pre";
import { ApiProp, ApiPropsList } from "@/components/mdx/api-prop";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsPanels,
} from "@/registry/default/tabs/tabs";

export function getMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
    // pre: MdxPre,
    CodeBlockMDX: MdxCodeBlockServer,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    TabsPanels,
    ComponentPreview: ComponentPreviewServer,
    ComponentCode: ComponentCodeServer,
    ComponentInstall: ComponentInstallServer,
    ComponentUsage: ComponentUsageServer,
    ApiProp,
    ApiPropsList,
  };
}
