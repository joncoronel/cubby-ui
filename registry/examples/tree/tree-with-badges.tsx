"use client";

import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeItemBadge,
  TreeNode,
} from "@/registry/default/tree/tree";
import { Badge } from "@/registry/default/badge/badge";

import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Folder01Icon, FolderOpenIcon } from "@hugeicons/core-free-icons";
const treeData: TreeNode[] = [
  {
    id: "documents",
    name: "Documents",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
    badge: <Badge variant="secondary">3 items</Badge>,
    children: [
      {
        id: "work",
        name: "Work",
        icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
        iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
        badge: <Badge variant="default">2</Badge>,
        children: [
          {
            id: "report.pdf",
            name: "Report.pdf",
            icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
            badge: <Badge variant="outline">Draft</Badge>,
          },
          {
            id: "proposal.pdf",
            name: "Proposal.pdf",
            icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
            badge: <Badge variant="success">Final</Badge>,
          },
        ],
      },
      {
        id: "personal",
        name: "Personal",
        icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
        iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
        badge: <Badge variant="default">1</Badge>,
        children: [
          {
            id: "resume.pdf",
            name: "Resume.pdf",
            icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
            badge: <Badge variant="warning">Review</Badge>,
          },
        ],
      },
    ],
  },
  {
    id: "pictures",
    name: "Pictures",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
    badge: <Badge variant="secondary">2 items</Badge>,
    children: [
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
    ],
  },
  {
    id: "archive",
    name: "Archive",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-muted-foreground"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-muted-foreground"  strokeWidth={2} />,
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
