"use client";

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
    badge: <Badge variant="secondary">3 items</Badge>,
    children: [
      {
        id: "work",
        name: "Work",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        badge: <Badge variant="default">2</Badge>,
        children: [
          {
            id: "report.pdf",
            name: "Report.pdf",
            icon: <FileIcon className="text-muted-foreground" />,
            badge: <Badge variant="outline">Draft</Badge>,
          },
          {
            id: "proposal.pdf",
            name: "Proposal.pdf",
            icon: <FileIcon className="text-muted-foreground" />,
            badge: <Badge variant="success">Final</Badge>,
          },
        ],
      },
      {
        id: "personal",
        name: "Personal",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        badge: <Badge variant="default">1</Badge>,
        children: [
          {
            id: "resume.pdf",
            name: "Resume.pdf",
            icon: <FileIcon className="text-muted-foreground" />,
            badge: <Badge variant="warning">Review</Badge>,
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
    badge: <Badge variant="secondary">2 items</Badge>,
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
    id: "archive",
    name: "Archive",
    icon: <FolderIcon className="text-muted-foreground" />,
    iconOpen: <FolderOpenIcon className="text-muted-foreground" />,
    badge: <Badge variant="danger">Old</Badge>,
    children: [],
  },
];

export default function TreeWithBadges() {
  return (
    <div className="w-full max-w-xs">
      <Tree data={treeData} defaultExpanded={["documents", "work"]}>
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
