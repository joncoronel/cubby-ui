"use client";

import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeNode,
} from "@/registry/default/tree/tree";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Folder01Icon, FolderOpenIcon } from "@hugeicons/core-free-icons";
const treeData: TreeNode[] = [
  {
    id: "src",
    name: "src",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
    children: [
      {
        id: "components",
        name: "components",
        icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
        iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
        children: [
          {
            id: "button.tsx",
            name: "Button.tsx",
            icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
          },
          {
            id: "input.tsx",
            name: "Input.tsx",
            icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
          },
        ],
      },
      {
        id: "lib",
        name: "lib",
        icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
        iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
        children: [
          {
            id: "utils.ts",
            name: "utils.ts",
            icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
          },
        ],
      },
    ],
  },
];

export default function TreeWithLines() {
  return (
    <div className="w-full max-w-xs">
      <Tree data={treeData} showLines defaultExpanded={["src", "components"]}>
        {(item) => (
          <TreeItem>
            {item.icon && <TreeItemIcon>{item.icon}</TreeItemIcon>}
            <TreeItemLabel>{item.name}</TreeItemLabel>
          </TreeItem>
        )}
      </Tree>
    </div>
  );
}
