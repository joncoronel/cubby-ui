"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  FolderOpenIcon,
  PackageIcon,
  Typescript01Icon,
} from "@hugeicons/core-free-icons";
import {
  Tree,
  TreeItem,
  TreeItemBadge,
  TreeItemIcon,
  TreeItemLabel,
  type TreeNode,
} from "@/registry/default/tree/tree";
import { Badge } from "@/registry/default/badge/badge";

const folder = {
  icon: (
    <HugeiconsIcon
      icon={Folder01Icon}
      strokeWidth={2}
      className="text-muted-foreground"
    />
  ),
  iconOpen: (
    <HugeiconsIcon
      icon={FolderOpenIcon}
      strokeWidth={2}
      className="text-muted-foreground"
    />
  ),
};

const tsx = (
  <HugeiconsIcon
    icon={Typescript01Icon}
    strokeWidth={2}
    className="text-primary"
  />
);

/** A project right after an install: the new file, where it landed. */
const PROJECT: TreeNode[] = [
  {
    id: "app",
    name: "app",
    ...folder,
    children: [
      { id: "app/layout.tsx", name: "layout.tsx", icon: tsx },
      { id: "app/page.tsx", name: "page.tsx", icon: tsx },
    ],
  },
  {
    id: "components",
    name: "components",
    ...folder,
    children: [
      {
        id: "components/ui",
        name: "ui",
        ...folder,
        children: [
          {
            id: "components/ui/cubby-ui",
            name: "cubby-ui",
            ...folder,
            children: [
              {
                id: "tree.tsx",
                name: "tree.tsx",
                icon: tsx,
                badge: <Badge variant="success">new</Badge>,
              },
              { id: "button.tsx", name: "button.tsx", icon: tsx },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "package.json",
    name: "package.json",
    icon: (
      <HugeiconsIcon
        icon={PackageIcon}
        strokeWidth={2}
        className="text-muted-foreground"
      />
    ),
  },
];

/**
 * The Tree as a real project explorer, opened to the file an install just
 * added: file-type icons, open folders, guide lines, a badge and selection.
 */
export function TreeDemo() {
  const [selected, setSelected] = React.useState<string>("tree.tsx");

  return (
    <div className="w-full max-w-[17rem]">
      <Tree
        data={PROJECT}
        size="sm"
        showLines
        defaultExpanded={[
          "components",
          "components/ui",
          "components/ui/cubby-ui",
        ]}
        selectedNode={selected}
        onNodeSelect={setSelected}
      >
        {(item) => (
          <TreeItem>
            {item.icon && <TreeItemIcon>{item.icon}</TreeItemIcon>}
            <TreeItemLabel>{item.name}</TreeItemLabel>
            {item.badge && <TreeItemBadge>{item.badge}</TreeItemBadge>}
          </TreeItem>
        )}
      </Tree>
    </div>
  );
}
