"use client";

import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeNode,
} from "@/registry/default/tree/tree";
import {
  FolderIcon,
  FolderOpenIcon,
  FileIcon,
  LockIcon,
  LoaderIcon,
} from "lucide-react";

const treeData: TreeNode[] = [
  {
    id: "public",
    name: "Public Files",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    children: [
      {
        id: "public-1.pdf",
        name: "Document.pdf",
        icon: <FileIcon className="text-muted-foreground" />,
      },
      {
        id: "public-2.pdf",
        name: "Image.jpg",
        icon: <FileIcon className="text-muted-foreground" />,
      },
    ],
  },
  {
    id: "private",
    name: "Private Files (Disabled)",
    icon: <LockIcon className="text-destructive" />,
    disabled: true,
    children: [
      {
        id: "private-1.pdf",
        name: "Secret.pdf",
        icon: <FileIcon className="text-muted-foreground" />,
        disabled: true,
      },
      {
        id: "private-2.pdf",
        name: "Confidential.pdf",
        icon: <FileIcon className="text-muted-foreground" />,
        disabled: true,
      },
    ],
  },
  {
    id: "loading",
    name: "Loading Folder",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    loading: true,
    children: [
      {
        id: "temp-1.pdf",
        name: "File.pdf",
        icon: <FileIcon className="text-muted-foreground" />,
      },
    ],
  },
  {
    id: "single-disabled",
    name: "Disabled File.pdf",
    icon: <FileIcon className="text-muted-foreground" />,
    disabled: true,
  },
  {
    id: "single-loading",
    name: "Loading File.pdf",
    icon: <FileIcon className="text-muted-foreground" />,
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
