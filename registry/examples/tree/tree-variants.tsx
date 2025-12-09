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
    id: "documents",
    name: "Documents",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    children: [
      {
        id: "work",
        name: "Work",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        children: [
          {
            id: "report.pdf",
            name: "Report.pdf",
            icon: <FileIcon className="text-muted-foreground" />,
          },
        ],
      },
    ],
  },
  {
    id: "pictures",
    name: "Pictures",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    children: [
      {
        id: "vacation.jpg",
        name: "Vacation.jpg",
        icon: <FileIcon className="text-muted-foreground" />,
      },
    ],
  },
];

export default function TreeVariants() {
  return (
    <div className="grid w-full max-w-xs grid-cols-1 gap-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Default</h3>
        <Tree data={treeData} defaultExpanded={["documents"]}>
          {(item) => (
            <TreeItem>
              {item.icon && <TreeItemIcon>{item.icon}</TreeItemIcon>}
              <TreeItemLabel>{item.name}</TreeItemLabel>
            </TreeItem>
          )}
        </Tree>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Filled</h3>
        <Tree data={treeData} variant="filled" defaultExpanded={["documents"]}>
          {(item) => (
            <TreeItem>
              {item.icon && <TreeItemIcon>{item.icon}</TreeItemIcon>}
              <TreeItemLabel>{item.name}</TreeItemLabel>
            </TreeItem>
          )}
        </Tree>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Outline</h3>
        <Tree data={treeData} variant="outline" defaultExpanded={["documents"]}>
          {(item) => (
            <TreeItem>
              {item.icon && <TreeItemIcon>{item.icon}</TreeItemIcon>}
              <TreeItemLabel>{item.name}</TreeItemLabel>
            </TreeItem>
          )}
        </Tree>
      </div>
    </div>
  );
}
