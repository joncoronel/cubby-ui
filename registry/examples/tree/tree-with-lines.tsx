"use client";

import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeNode,
} from "@/registry/default/tree/tree";
import { FolderIcon, FolderOpenIcon, FileIcon } from "lucide-react";

const treeData: TreeNode[] = [
  {
    id: "src",
    name: "src",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    children: [
      {
        id: "components",
        name: "components",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        children: [
          {
            id: "button.tsx",
            name: "Button.tsx",
            icon: <FileIcon className="text-muted-foreground" />,
          },
          {
            id: "input.tsx",
            name: "Input.tsx",
            icon: <FileIcon className="text-muted-foreground" />,
          },
        ],
      },
      {
        id: "lib",
        name: "lib",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        children: [
          {
            id: "utils.ts",
            name: "utils.ts",
            icon: <FileIcon className="text-muted-foreground" />,
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
