"use client";

import {
  Tree,
  TreeItem,
  TreeItemLabel,
  TreeNode,
} from "@/registry/default/tree/tree";

const treeData: TreeNode[] = [
  {
    id: "documents",
    name: "Documents",
    children: [
      { id: "resume.pdf", name: "Resume.pdf" },
      { id: "cover-letter.pdf", name: "Cover Letter.pdf" },
      {
        id: "projects",
        name: "Projects",
        children: [
          { id: "website", name: "Website" },
          { id: "mobile-app", name: "Mobile App" },
        ],
      },
    ],
  },
  {
    id: "pictures",
    name: "Pictures",
    children: [
      { id: "vacation.jpg", name: "Vacation.jpg" },
      { id: "family.jpg", name: "Family.jpg" },
    ],
  },
  { id: "music.mp3", name: "Music.mp3" },
];

export default function TreeBasic() {
  return (
    <div className="w-full max-w-xs">
      <Tree data={treeData} defaultExpanded={["documents"]}>
        {(item) => (
          <TreeItem>
            <TreeItemLabel>{item.name}</TreeItemLabel>
          </TreeItem>
        )}
      </Tree>
    </div>
  );
}
