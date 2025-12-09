"use client";

import { useState } from "react";
import {
  Tree,
  TreeItem,
  TreeItemLabel,
  TreeNode,
} from "@/registry/default/tree/tree";
import { Button } from "@/registry/default/button/button";

const treeData: TreeNode[] = [
  {
    id: "features",
    name: "Features",
    children: [
      {
        id: "authentication",
        name: "Authentication",
        children: [
          { id: "login", name: "Login" },
          { id: "signup", name: "Sign Up" },
          { id: "password-reset", name: "Password Reset" },
        ],
      },
      {
        id: "dashboard",
        name: "Dashboard",
        children: [
          { id: "analytics", name: "Analytics" },
          { id: "reports", name: "Reports" },
        ],
      },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    children: [
      { id: "profile", name: "Profile" },
      { id: "preferences", name: "Preferences" },
    ],
  },
];

export default function TreeControlled() {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["features"]);
  const [selectedNode, setSelectedNode] = useState<string>();

  const expandAll = () => {
    setExpandedNodes(["features", "authentication", "dashboard", "settings"]);
  };

  const collapseAll = () => {
    setExpandedNodes([]);
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      <Tree
        data={treeData}
        expanded={expandedNodes}
        onExpandedChange={setExpandedNodes}
        selectedNode={selectedNode}
        onNodeSelect={setSelectedNode}
      >
        {(item) => (
          <TreeItem>
            <TreeItemLabel>{item.name}</TreeItemLabel>
          </TreeItem>
        )}
      </Tree>

      <div className="text-muted-foreground space-y-1 text-xs">
        <div>Expanded: {expandedNodes.join(", ") || "None"}</div>
        <div>Selected: {selectedNode || "None"}</div>
      </div>
    </div>
  );
}
