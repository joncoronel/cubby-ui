"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import type { ReactElement } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  File01Icon,
  Folder01Icon,
  FolderOpenIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/registry/default/button/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";
import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  type TreeNode,
} from "@/registry/default/tree/tree";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";
import { CodePeek } from "./code-peek";

export interface SourceFile {
  relativePath: string;
  content: string;
  highlighted: ReactElement;
}

interface SourceFilesProps {
  files: SourceFile[];
  active: string;
  onActiveChange: (path: string) => void;
}

/** The tray is wide enough for a file tree beside the code from here. */
const TREE_MIN_WIDTH = 544;

/** Folder ids can't collide with file ids, which are paths. */
const DIR = "dir:";

const folderIcon = <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />;
const folderOpenIcon = <HugeiconsIcon icon={FolderOpenIcon} strokeWidth={2} />;
const fileIcon = <HugeiconsIcon icon={File01Icon} strokeWidth={2} />;

type Draft =
  | { kind: "file"; name: string; path: string }
  | { kind: "dir"; name: string; path: string; children: Draft[] };

/**
 * The files as the Tree's nodes under their shared folder: at each level
 * files come first, then folders, each in the registry's order (the main
 * file leads). A folder holding only one folder merges into one row
 * (`components/ui/cubby-ui/code-block`), as editors show it: a component
 * with a shared lib file has no common folder, and the chain otherwise
 * indented every file five levels.
 */
function buildTree(files: SourceFile[], base: string[]): TreeNode[] {
  const root: Draft[] = [];
  for (const file of files) {
    const segs = file.relativePath.split("/").slice(base.length);
    let level = root;
    let path = base.join("/");
    for (const dir of segs.slice(0, -1)) {
      path = path ? `${path}/${dir}` : dir;
      let node = level.find(
        (n): n is Extract<Draft, { kind: "dir" }> =>
          n.kind === "dir" && n.name === dir,
      );
      if (!node) {
        node = { kind: "dir", name: dir, path, children: [] };
        level.push(node);
      }
      level = node.children;
    }
    level.push({
      kind: "file",
      name: segs[segs.length - 1],
      path: file.relativePath,
    });
  }

  const order = (drafts: Draft[]): Draft[] => [
    ...drafts.filter((d) => d.kind === "file"),
    ...drafts.filter((d) => d.kind === "dir"),
  ];
  const toNode = (draft: Draft): TreeNode => {
    if (draft.kind === "file") {
      return { id: draft.path, name: draft.name, icon: fileIcon };
    }
    let dir = draft;
    while (dir.children.length === 1 && dir.children[0].kind === "dir") {
      const only = dir.children[0];
      dir = { ...only, name: `${dir.name}/${only.name}` };
    }
    return {
      id: DIR + dir.path,
      name: dir.name,
      icon: folderIcon,
      iconOpen: folderOpenIcon,
      children: order(dir.children).map(toNode),
    };
  };

  const nodes = order(root).map(toNode);
  // The folder heads the tree as its own level, so what sits inside it steps
  // in under it.
  const rootName = base[base.length - 1];
  return rootName
    ? [
        {
          id: DIR + base.join("/"),
          name: rootName,
          icon: folderIcon,
          iconOpen: folderOpenIcon,
          children: nodes,
        },
      ]
    : nodes;
}

/**
 * The component's own folder (the main file's, which leads the registry's
 * list) as the root, so every page opens on the component's name; then any
 * shared files installed elsewhere (`lib/cubby-ui/elevated.tsx`), as
 * folders of their own beside it. Taking the folder all the files share
 * instead left a component with a shared file no root at all, and its first
 * row a long path cut short.
 */
function sourceTree(files: SourceFile[]): TreeNode[] {
  const own = files[0].relativePath.split("/").slice(0, -1);
  const prefix = `${own.join("/")}/`;
  const inside = files.filter((f) => f.relativePath.startsWith(prefix));
  const shared = files.filter((f) => !f.relativePath.startsWith(prefix));
  return [...buildTree(inside, own), ...buildTree(shared, [])];
}

/** Every folder's id, so the tree opens fully expanded. */
function folderIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) =>
    n.children ? [n.id, ...folderIds(n.children)] : [],
  );
}

/** The files in the tree's reading order, with the folder each sits in. */
function flatten(
  nodes: TreeNode[],
  dir = "",
): Array<{ path: string; name: string; dir: string }> {
  return nodes.flatMap((n) =>
    n.children
      ? flatten(n.children, dir ? `${dir}/${n.name}` : n.name)
      : [{ path: n.id, name: n.name, dir }],
  );
}

/**
 * A component's source files, for one with too many for a row of tabs. On
 * a wide tray, an editor-like window: the files in the Tree beside the
 * code, showing the folder they recreate (nine of TextMorph's eleven go in
 * `lib/`). On a narrow one, previous and next pinned to the left, then a
 * Select of the files grouped by folder and the position, above the code
 * as a peek.
 */
export function SourceFiles({
  files,
  active,
  onActiveChange,
}: SourceFilesProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [wide, setWide] = React.useState(true);

  // The tray's own width decides, not the viewport's: it sits indented in a
  // step, inside the page column.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      // Hidden (the closed install-by-hand section) it measures 0: keep the
      // last layout, or opening it showed the narrow one for a frame.
      if (entry.contentRect.width === 0) return;
      // Applied before the paint the observer runs ahead of, so the right
      // layout is the first one seen (a plain update landed a frame late,
      // flashing the other layout as the section opened).
      const next = entry.contentRect.width >= TREE_MIN_WIDTH;
      flushSync(() => setWide(next));
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const tree = React.useMemo(() => sourceTree(files), [files]);
  const expanded = React.useMemo(() => folderIds(tree), [tree]);
  const flat = React.useMemo(() => flatten(tree), [tree]);

  const index = Math.max(
    0,
    flat.findIndex((f) => f.path === active),
  );
  const file = files.find((f) => f.relativePath === active) ?? files[0];

  const step = (by: number): void => {
    onActiveChange(flat[(index + by + flat.length) % flat.length].path);
  };

  // Groups for the select, one per folder, in reading order.
  const groups = flat.reduce<Array<{ dir: string; items: typeof flat }>>(
    (acc, f) => {
      const last = acc[acc.length - 1];
      if (last && last.dir === f.dir) last.items.push(f);
      else acc.push({ dir: f.dir, items: [f] });
      return acc;
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      data-layout={wide ? "tree" : "picker"}
      className={cn("docs-files", solidSurface(3, 1), "bg-muted")}
    >
      {wide ? (
        <>
          <div className="docs-files-tree">
            <Tree
              data={tree}
              size="sm"
              aria-label="Source files"
              defaultExpanded={expanded}
              selectedNode={file.relativePath}
              onNodeSelect={(id) => {
                if (!id.startsWith(DIR)) onActiveChange(id);
              }}
            >
              {(item) => (
                <TreeItem>
                  <TreeItemIcon className="[&>svg]:size-3.5">
                    {item.icon}
                  </TreeItemIcon>
                  <TreeItemLabel title={item.name}>{item.name}</TreeItemLabel>
                </TreeItem>
              )}
            </Tree>
          </div>
          <CodePeek
            fill
            variant="card"
            code={file.content}
            initial={file.highlighted}
          />
        </>
      ) : (
        <>
          {/* Previous and next lead, so they never move with the name's
              length; a long name truncates in the select instead. */}
          <div className="docs-files-bar">
            <div className="flex shrink-0 items-center">
              <Button
                variant="ghost"
                size="icon_xs"
                aria-label="Previous file"
                onClick={() => step(-1)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
              </Button>
              <Button
                variant="ghost"
                size="icon_xs"
                aria-label="Next file"
                onClick={() => step(1)}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Button>
            </div>
            <Select
              value={file.relativePath}
              onValueChange={(value) => onActiveChange(value as string)}
            >
              <SelectTrigger
                variant="ghost"
                size="sm"
                aria-label="Source file"
                className="text-foreground max-w-full min-w-0 px-2"
              >
                <SelectValue className="min-w-0">
                  {() => <span className="truncate">{flat[index]?.name}</span>}
                </SelectValue>
              </SelectTrigger>
              <SelectContent size="sm" className="min-w-56">
                {groups.map((group) => (
                  <SelectGroup key={group.dir || "."}>
                    <SelectGroupLabel>
                      {group.dir ? `${group.dir}/` : "./"}
                    </SelectGroupLabel>
                    {group.items.map((f) => (
                      <SelectItem key={f.path} value={f.path}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground ml-auto shrink-0 pr-2 text-xs tabular-nums">
              {index + 1} of {flat.length}
            </span>
          </div>
          <CodePeek
            variant="card"
            code={file.content}
            initial={file.highlighted}
          />
        </>
      )}
    </div>
  );
}
