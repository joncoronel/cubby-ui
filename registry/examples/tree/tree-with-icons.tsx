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
          {
            id: "proposal.pdf",
            name: "Proposal.pdf",
            icon: <FileIcon className="text-muted-foreground" />,
          },
        ],
      },
      {
        id: "personal",
        name: "Personal",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        children: [
          {
            id: "resume.pdf",
            name: "Resume.pdf",
            icon: <FileIcon className="text-muted-foreground" />,
          },
        ],
      },
    ],
  },
  {
    id: "pictures",
    name: "Pictures",
    icon: <FolderIcon className="text-green-500" />,
    iconOpen: <FolderOpenIcon className="text-green-500" />,
    children: [
      {
        id: "vacation.jpg",
        name: "Vacation.jpg",
        icon: <FileIcon className="text-muted-foreground" />,
      },
      {
        id: "family.jpg",
        name: "Family.jpg",
        icon: <FileIcon className="text-muted-foreground" />,
      },
    ],
  },
];

export default function TreeWithIcons() {
  return (
    <div className="w-full max-w-xs">
      <Tree data={treeData} defaultExpanded={["documents"]}>
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
