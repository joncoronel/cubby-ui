import type * as PageTree from "fumadocs-core/page-tree";
import { source } from "@/lib/source";

export type ShelfItem = {
  name: string;
  url: string;
  description?: string;
  type?: "primitive" | "composable";
  /** URLs of the components this one is built on. */
  builtOn?: string[];
};

export type ShelfGroup = {
  label: string;
  /** Component groups render as a cubby grid, the rest as a plain list. */
  kind: "grid" | "list";
  items: ShelfItem[];
};

function nodeName(name: PageTree.Node["name"]): string {
  return typeof name === "string" ? name : String(name ?? "");
}

/**
 * Flattens Fumadocs' page tree into the shelf's groups. Separators open a new
 * group; folders become their own group so Primitives and Composables stay
 * apart. Order follows the tree, so meta.json still controls it.
 */
export function getShelfGroups(): ShelfGroup[] {
  const meta = new Map(source.getPages().map((page) => [page.url, page.data]));
  const groups: ShelfGroup[] = [];
  let current: ShelfGroup | null = null;

  const toItem = (node: PageTree.Item): ShelfItem => {
    const data = meta.get(node.url);
    return {
      name: nodeName(node.name),
      url: node.url,
      description: data?.description,
      type: data?.type,
      builtOn: data?.builtOn?.map((slug) => `/docs/components/${slug}`),
    };
  };

  const collect = (nodes: PageTree.Node[], into: ShelfItem[]) => {
    for (const node of nodes) {
      if (node.type === "page") into.push(toItem(node));
      else if (node.type === "folder") {
        if (node.index) into.push(toItem(node.index));
        collect(node.children, into);
      }
    }
  };

  const walk = (nodes: PageTree.Node[]) => {
    for (const node of nodes) {
      if (node.type === "separator") {
        current = { label: nodeName(node.name), kind: "list", items: [] };
        groups.push(current);
      } else if (node.type === "page") {
        if (!current) {
          current = { label: "Docs", kind: "list", items: [] };
          groups.push(current);
        }
        current.items.push(toItem(node));
      } else if (node.type === "folder") {
        const pages: ShelfItem[] = [];
        collect(node.children, pages);
        if (node.index) pages.unshift(toItem(node.index));
        // A folder of components (Primitives / Composables) becomes its own
        // grid; any other folder folds into the group it sits under.
        const isComponents = pages.some((p) => p.type);
        if (isComponents) {
          groups.push({ label: nodeName(node.name), kind: "grid", items: pages });
        } else if (node.children.some((c) => c.type === "folder")) {
          walk(node.children);
        } else {
          if (!current) {
            current = { label: nodeName(node.name), kind: "list", items: [] };
            groups.push(current);
          }
          current.items.push(...pages);
        }
      }
    }
  };

  walk(source.pageTree.children);
  return groups.filter((group) => group.items.length > 0);
}
