"use client";

import { useState } from "react";
import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeItemBadge,
  TreeNode,
} from "@/registry/default/tree/tree";
import { FolderIcon, FolderOpenIcon, FileIcon } from "lucide-react";
import { Badge } from "@/registry/default/badge/badge";

const treeData: TreeNode[] = [
  {
    id: "documents",
    name: "Documents",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    badge: <Badge variant="secondary">New</Badge>,
    children: [
      {
        id: "work",
        name: "Work",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        badge: <Badge>2</Badge>,
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
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
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
  {
    id: "families.jpg",
    name: "Families.jpg",
    icon: <FileIcon className="text-muted-foreground" />,
  },
];

export default function TreeWithCheckboxes() {
  const [checkedNodes, setCheckedNodes] = useState<string[]>([]);

  return (
    <div className="w-full max-w-xs">
      <Tree
        data={treeData}
        mode="multiple"
        checkedNodes={checkedNodes}
        onCheckedNodesChange={setCheckedNodes}
        defaultExpanded={["documents", "work"]}
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
