"use client";

import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeNode,
} from "@/registry/default/tree/tree";
import { FolderIcon, FolderOpenIcon, FileIcon } from "lucide-react";

// Simulate async API call
const fetchChildren = async (parentId: string): Promise<TreeNode[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return different children based on parent
  if (parentId === "documents") {
    return [
      {
        id: "work",
        name: "Work",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        children: [],
        onLoadChildren: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return [
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
          ];
        },
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
    ];
  }

  if (parentId === "pictures") {
    return [
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
    ];
  }

  return [];
};

const treeData: TreeNode[] = [
  {
    id: "documents",
    name: "Documents (Click to load)",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    children: [],
    onLoadChildren: () => fetchChildren("documents"),
  },
  {
    id: "pictures",
    name: "Pictures (Click to load)",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    children: [],
    onLoadChildren: () => fetchChildren("pictures"),
  },
  {
    id: "readme.txt",
    name: "Readme.txt",
    icon: <FileIcon className="text-muted-foreground" />,
  },
];

export default function TreeAsyncLoading() {
  return (
    <div className="w-full max-w-xs">
      <Tree data={treeData}>
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
