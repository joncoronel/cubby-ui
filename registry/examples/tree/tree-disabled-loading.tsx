"use client";

import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeNode,
} from "@/registry/default/tree/tree";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Folder01Icon,
  FolderOpenIcon,
  LockIcon,
} from "@hugeicons/core-free-icons";
const treeData: TreeNode[] = [
  {
    id: "public",
    name: "Public Files",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
    children: [
      {
        id: "public-1.pdf",
        name: "Document.pdf",
        icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
      },
      {
        id: "public-2.pdf",
        name: "Image.jpg",
        icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
      },
    ],
  },
  {
    id: "private",
    name: "Private Files (Disabled)",
    icon: <HugeiconsIcon icon={LockIcon} className="text-destructive"  strokeWidth={2} />,
    disabled: true,
    children: [
      {
        id: "private-1.pdf",
        name: "Secret.pdf",
        icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
        disabled: true,
      },
      {
        id: "private-2.pdf",
        name: "Confidential.pdf",
        icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
        disabled: true,
      },
    ],
  },
  {
    id: "loading",
    name: "Loading Folder",
    icon: <HugeiconsIcon icon={Folder01Icon} className="text-blue-500"  strokeWidth={2} />,
    iconOpen: <HugeiconsIcon icon={FolderOpenIcon} className="text-blue-500"  strokeWidth={2} />,
    loading: true,
    children: [
      {
        id: "temp-1.pdf",
        name: "File.pdf",
        icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
      },
    ],
  },
  {
    id: "single-disabled",
    name: "Disabled File.pdf",
    icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
    disabled: true,
  },
  {
    id: "single-loading",
    name: "Loading File.pdf",
    icon: <HugeiconsIcon icon={File01Icon} className="text-muted-foreground"  strokeWidth={2} />,
    loading: true,
  },
];

export default function TreeDisabledLoading() {
  return (
    <div className="w-full max-w-xs">
      <Tree
        data={treeData}
        mode="none"
        defaultExpanded={["public", "private", "loading"]}
      >
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
