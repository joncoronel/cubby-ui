import type { TreeNode } from "../tree";

/**
 * Validate tree structure for circular references and duplicate IDs
 * @param nodes - The tree data array
 * @param seen - Set of IDs already seen (for internal use)
 * @throws Error if circular reference or duplicate ID is detected
 */
export function validateTreeStructure<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(nodes: TreeNode<TData>[], seen = new Set<string>()): void {
  const idsInLevel = new Set<string>();

  for (const node of nodes) {
    // Check for duplicate IDs
    if (idsInLevel.has(node.id)) {
      throw new Error(`Tree validation error: Duplicate node ID "${node.id}"`);
    }
    idsInLevel.add(node.id);

    // Check for circular references
    if (seen.has(node.id)) {
      throw new Error(
        `Tree validation error: Circular reference detected for node ID "${node.id}"`,
      );
    }

    const newSeen = new Set(seen);
    newSeen.add(node.id);

    if (node.children && node.children.length > 0) {
      validateTreeStructure(node.children, newSeen);
    }
  }
}

/**
 * Get all descendant IDs of a node (recursive)
 * @param node - The parent node
 * @returns Array of all descendant node IDs
 */
export function getAllDescendantIds<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(node: TreeNode<TData>): string[] {
  const ids: string[] = [];
  if (node.children) {
    for (const child of node.children) {
      ids.push(child.id);
      if (child.children && child.children.length > 0) {
        ids.push(...getAllDescendantIds(child));
      }
    }
  }
  return ids;
}

/**
 * Get IDs of all leaf nodes (nodes without children)
 * @param nodes - Array of tree nodes
 * @returns Array of leaf node IDs
 */
export function getLeafNodeIds<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(nodes: TreeNode<TData>[]): string[] {
  const leafIds: string[] = [];
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      leafIds.push(node.id);
    } else {
      leafIds.push(...getLeafNodeIds(node.children));
    }
  }
  return leafIds;
}

/**
 * Build a map of child node IDs to their parent node IDs
 * @param nodes - The tree data array
 * @param parentMap - Map to populate (for internal use)
 * @param parentId - Current parent ID (for internal use)
 * @returns Map of child ID to parent ID
 */
export function buildParentMap<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  nodes: TreeNode<TData>[],
  parentMap = new Map<string, string>(),
  parentId?: string,
): Map<string, string> {
  for (const node of nodes) {
    if (parentId) {
      parentMap.set(node.id, parentId);
    }
    if (node.children) {
      buildParentMap(node.children, parentMap, node.id);
    }
  }
  return parentMap;
}

/**
 * Collect IDs of all visible nodes (including children of expanded nodes)
 * @param nodes - The tree data array
 * @param expandedNodes - Set of expanded node IDs
 * @param ids - Array to populate (for internal use)
 * @param disabledMap - Map to track disabled nodes (for internal use)
 * @returns Object with visible node IDs and disabled nodes map
 */
export function collectVisibleIds<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  nodes: TreeNode<TData>[],
  expandedNodes: Set<string>,
  ids: string[] = [],
  disabledMap = new Map<string, boolean>(),
): { visibleNodeIds: string[]; disabledNodesMap: Map<string, boolean> } {
  for (const node of nodes) {
    ids.push(node.id);
    if (node.disabled) {
      disabledMap.set(node.id, true);
    }
    if (node.children && expandedNodes.has(node.id)) {
      collectVisibleIds(node.children, expandedNodes, ids, disabledMap);
    }
  }
  return { visibleNodeIds: ids, disabledNodesMap: disabledMap };
}

/**
 * Handle keyboard navigation for tree nodes
 * @param e - Keyboard event
 * @param params - Navigation parameters
 */
export function handleTreeKeyboardNavigation<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  e: React.KeyboardEvent,
  params: {
    nodeId: string;
    hasChildren: boolean;
    isExpanded: boolean;
    isDisabled: boolean;
    node: TreeNode<TData>;
    visibleNodeIds: string[];
    disabledNodesMap: Map<string, boolean>;
    parentNodeMap: Map<string, string>;
    focusableNodes: Map<string, HTMLElement>;
    enableBulkActions: boolean;
    disableSelection: boolean;
    onToggleNode: (nodeId: string) => void;
    onNodeSelect?: (nodeId: string) => void;
    setLastFocusedNodeId: (nodeId: string | null) => void;
    handleToggleChecked: () => void;
  },
): void {
  const {
    nodeId,
    hasChildren,
    isExpanded,
    isDisabled,
    node,
    visibleNodeIds,
    disabledNodesMap,
    parentNodeMap,
    focusableNodes,
    enableBulkActions,
    disableSelection,
    onToggleNode,
    onNodeSelect,
    setLastFocusedNodeId,
    handleToggleChecked,
  } = params;

  if (isDisabled) return;

  const currentIndex = visibleNodeIds.indexOf(nodeId);

  switch (e.key) {
    case " ":
      e.preventDefault();
      e.stopPropagation();
      if (enableBulkActions) {
        handleToggleChecked();
      } else {
        if (hasChildren) {
          onToggleNode(nodeId);
        }
        if (!disableSelection) {
          onNodeSelect?.(nodeId);
        }
      }
      break;

    case "Enter":
      e.preventDefault();
      e.stopPropagation();
      if (enableBulkActions) {
        if (hasChildren) {
          onToggleNode(nodeId);
        } else {
          handleToggleChecked();
        }
      } else {
        if (hasChildren) {
          onToggleNode(nodeId);
        }
        if (!disableSelection) {
          onNodeSelect?.(nodeId);
        }
      }
      break;

    case "ArrowRight":
      e.preventDefault();
      if (hasChildren) {
        if (!isExpanded) {
          onToggleNode(nodeId);
        } else {
          const firstChildId = node.children?.[0]?.id;
          if (firstChildId && !disabledNodesMap.has(firstChildId)) {
            const firstChildElement = focusableNodes.get(firstChildId);
            if (firstChildElement) {
              firstChildElement.focus();
              setLastFocusedNodeId(firstChildId);
            }
          }
        }
      }
      break;

    case "ArrowLeft":
      e.preventDefault();
      if (hasChildren && isExpanded) {
        onToggleNode(nodeId);
      } else {
        const parentId = parentNodeMap.get(nodeId);
        if (parentId) {
          const parentElement = focusableNodes.get(parentId);
          if (parentElement) {
            parentElement.focus();
            setLastFocusedNodeId(parentId);
          }
        }
      }
      break;

    case "ArrowDown": {
      e.preventDefault();
      let nextIndex = currentIndex + 1;
      while (nextIndex < visibleNodeIds.length) {
        const nextId = visibleNodeIds[nextIndex];
        if (disabledNodesMap.has(nextId)) {
          nextIndex++;
          continue;
        }
        const nextElement = focusableNodes.get(nextId);
        if (nextElement) {
          nextElement.focus();
          setLastFocusedNodeId(nextId);
          break;
        }
        nextIndex++;
      }
      break;
    }

    case "ArrowUp": {
      e.preventDefault();
      let prevIndex = currentIndex - 1;
      while (prevIndex >= 0) {
        const prevId = visibleNodeIds[prevIndex];
        if (disabledNodesMap.has(prevId)) {
          prevIndex--;
          continue;
        }
        const prevElement = focusableNodes.get(prevId);
        if (prevElement) {
          prevElement.focus();
          setLastFocusedNodeId(prevId);
          break;
        }
        prevIndex--;
      }
      break;
    }

    case "Home": {
      e.preventDefault();
      for (let i = 0; i < visibleNodeIds.length; i++) {
        const firstId = visibleNodeIds[i];
        if (disabledNodesMap.has(firstId)) continue;
        const firstElement = focusableNodes.get(firstId);
        if (firstElement) {
          firstElement.focus();
          setLastFocusedNodeId(firstId);
          break;
        }
      }
      break;
    }

    case "End": {
      e.preventDefault();
      for (let i = visibleNodeIds.length - 1; i >= 0; i--) {
        const lastId = visibleNodeIds[i];
        if (disabledNodesMap.has(lastId)) continue;
        const lastElement = focusableNodes.get(lastId);
        if (lastElement) {
          lastElement.focus();
          setLastFocusedNodeId(lastId);
          break;
        }
      }
      break;
    }
  }
}
