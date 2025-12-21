import type { MDXComponents } from "mdx/types";
import defaultComponents from "fumadocs-ui/mdx";
import { ComponentPreviewServer } from "@/components/mdx/component-preview-server";
import { ComponentCodeServer } from "@/components/mdx/component-code-server";
import { ComponentInstallServer } from "@/components/mdx/component-install-server";
import { ComponentUsageServer } from "@/components/mdx/component-usage-server";
import { PackageManagerCommandServer } from "@/components/mdx/package-manager-command-server";
import { MdxPreServer } from "@/components/mdx/mdx-pre-server";
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
    pre: MdxPreServer as unknown as MDXComponents["pre"],
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    TabsPanels,
    ComponentPreview: ComponentPreviewServer,
    ComponentCode: ComponentCodeServer,
    ComponentInstall: ComponentInstallServer,
    ComponentUsage: ComponentUsageServer,
    PackageManagerCommand: PackageManagerCommandServer,
    ApiProp,
    ApiPropsList,
  };
}
