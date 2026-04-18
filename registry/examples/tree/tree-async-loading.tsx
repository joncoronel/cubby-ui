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
        icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
        iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
        children: [],
        onLoadChildren: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return [
            {
              id: "report.pdf",
              name: "Report.pdf",
              icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
            },
            {
              id: "proposal.pdf",
              name: "Proposal.pdf",
              icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
            },
          ];
        },
      },
      {
        id: "personal",
        name: "Personal",
        icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
        iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
        children: [
          {
            id: "resume.pdf",
            name: "Resume.pdf",
            icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
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
        icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
      },
      {
        id: "family.jpg",
        name: "Family.jpg",
        icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
      },
    ];
  }

  return [];
};

const treeData: TreeNode[] = [
  {
    id: "documents",
    name: "Documents (Click to load)",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
    children: [],
    onLoadChildren: () => fetchChildren("documents"),
  },
  {
    id: "pictures",
    name: "Pictures (Click to load)",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
    children: [],
    onLoadChildren: () => fetchChildren("pictures"),
  },
  {
    id: "readme.txt",
    name: "Readme.txt",
    icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
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
