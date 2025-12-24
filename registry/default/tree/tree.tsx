"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { CheckboxGroup } from "@base-ui/react/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { ChevronRightIcon, Loader2Icon } from "lucide-react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import {
  getAllDescendantIds,
  getLeafNodeIds,
  buildParentMap,
  collectVisibleIds,
  handleTreeKeyboardNavigation,
} from "@/registry/default/tree/lib/tree-utils";

// ============================================================================
// Types
// ============================================================================

export interface TreeNodeBase<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  name: string;
  data?: TData;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TreeLeafNode<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends TreeNodeBase<TData> {
  children?: never;
}

export interface TreeParentNode<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends TreeNodeBase<TData> {
  children: TreeNode<TData>[];
  iconOpen?: React.ReactNode;
  onLoadChildren?: () => Promise<TreeNode<TData>[]>;
}

export type TreeNode<
  TData extends Record<string, unknown> = Record<string, unknown>,
> = TreeLeafNode<TData> | TreeParentNode<TData>;

export interface TreeSelectEvent<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  nodeId: string;
  node: TreeNode<TData>;
  event: React.MouseEvent | React.KeyboardEvent;
}

export interface TreeExpandEvent {
  nodeId: string;
  expanded: boolean;
}

type TreeVariant = "default" | "filled" | "outline";
type TreeMode = "single" | "multiple" | "none";

// ============================================================================
// Context
// ============================================================================

interface TreeContextValue<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  // Tree-level state
  selectedNode?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void | Promise<void>;
  checkedNodes?: Set<string>;
  onCheckedNodesChange?: (checked: string[]) => void;
  renderItem: (item: TreeNode<TData>) => React.ReactElement;
  variant: TreeVariant;
  showLines: boolean;
  enableBulkActions: boolean;
  disableSelection: boolean;
  focusableNodes: React.MutableRefObject<Map<string, HTMLElement>>;
  visibleNodeIds: string[];
  disabledNodesMap: Map<string, boolean>;
  loadingNodesMap: Map<string, boolean>;
  parentNodeMap: Map<string, string>;
  lastFocusedNodeId: string | null;
  setLastFocusedNodeId: (nodeId: string | null) => void;
  data: TreeNode<TData>[];
  // Item-level state
  item?: TreeNode<TData>;
  depth?: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  hasChildren?: boolean;
  isLoading?: boolean;
}

const TreeContext = React.createContext<TreeContextValue | null>(null);

function useTreeContext<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(): TreeContextValue<TData> {
  const context = React.useContext(
    TreeContext,
  ) as TreeContextValue<TData> | null;
  if (!context) {
    throw new Error("Tree components must be used within a Tree");
  }
  return context;
}

// Extracts item-level state from context for TreeItem subcomponents
function useTreeItemContext<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(): Required<
  Pick<
    TreeContextValue<TData>,
    "item" | "depth" | "isExpanded" | "isSelected" | "hasChildren" | "isLoading"
  >
> {
  const context = useTreeContext<TData>();
  if (!context.item) {
    throw new Error("TreeItem subcomponents must be used within TreeItem");
  }
  return {
    item: context.item,
    depth: context.depth!,
    isExpanded: context.isExpanded!,
    isSelected: context.isSelected!,
    hasChildren: context.hasChildren!,
    isLoading: context.isLoading!,
  };
}

// ============================================================================
// Tree Root
// ============================================================================

export interface TreeProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<useRender.ComponentProps<"div">, "children"> {
  data: TreeNode<TData>[];
  children: (item: TreeNode<TData>) => React.ReactElement;
  selectedNode?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  checkedNodes?: string[];
  onCheckedNodesChange?: (checked: string[]) => void;
  variant?: TreeVariant;
  showLines?: boolean;
  mode?: TreeMode;
}

function Tree<TData extends Record<string, unknown> = Record<string, unknown>>({
  data,
  children: renderItem,
  selectedNode,
  onNodeSelect,
  defaultExpanded = [],
  expanded,
  onExpandedChange,
  checkedNodes,
  onCheckedNodesChange,
  variant = "default",
  showLines = false,
  mode = "single",
  className,
  render,
  ...props
}: TreeProps<TData>): React.ReactElement {
  // Derive internal flags from mode
  const enableBulkActions = mode === "multiple";
  const disableSelection = mode === "none";
  // Validate tree structure in development
  if (process.env.NODE_ENV === "development") {
    React.useEffect(() => {
      try {
        const { validateTreeStructure } = require("@/registry/default/tree/lib/tree-utils");
        validateTreeStructure(data);
      } catch (error) {
        console.error("Tree validation error:", error);
      }
    }, [data]);
  }

  // Store renderItem in ref for stable context reference
  const renderItemRef = React.useRef(renderItem);
  renderItemRef.current = renderItem;

  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpanded),
  );

  const focusableNodes = React.useRef<Map<string, HTMLElement>>(new Map());
  const [lastFocusedNodeId, setLastFocusedNodeId] = React.useState<
    string | null
  >(null);

  // Track nodes that are currently loading children
  const [loadingNodes, setLoadingNodes] = React.useState<Set<string>>(
    () => new Set(),
  );

  // Track nodes that have already loaded their children
  const loadedNodesRef = React.useRef<Set<string>>(new Set());

  // Store dynamically loaded children
  const [loadedChildren, setLoadedChildren] = React.useState<
    Map<string, TreeNode<TData>[]>
  >(() => new Map());

  const expandedNodes = React.useMemo(() => {
    return expanded ? new Set(expanded) : internalExpanded;
  }, [expanded, internalExpanded]);

  // Merge loaded children into the tree data
  const mergedData = React.useMemo(() => {
    if (loadedChildren.size === 0) return data;

    const mergeChildren = (nodes: TreeNode<TData>[]): TreeNode<TData>[] => {
      return nodes.map((node) => {
        const loaded = loadedChildren.get(node.id);
        if (loaded) {
          return { ...node, children: loaded };
        }
        if (node.children) {
          return { ...node, children: mergeChildren(node.children) };
        }
        return node;
      });
    };

    return mergeChildren(data);
  }, [data, loadedChildren]);

  const handleToggleNode = React.useCallback(
    async (nodeId: string) => {
      const isCurrentlyExpanded = expandedNodes.has(nodeId);
      const isExpanding = !isCurrentlyExpanded;

      // Find the node to check if it needs to load children
      const findNode = (
        nodes: TreeNode<TData>[],
      ): TreeNode<TData> | undefined => {
        for (const node of nodes) {
          if (node.id === nodeId) return node;
          if (node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const node = findNode(mergedData);
      const needsToLoad =
        isExpanding &&
        node &&
        "onLoadChildren" in node &&
        node.onLoadChildren &&
        !loadedNodesRef.current.has(nodeId);

      // If we need to load children, delay expansion until loaded
      if (needsToLoad) {
        setLoadingNodes((prev) => new Set(prev).add(nodeId));
        loadedNodesRef.current.add(nodeId);

        try {
          const children = await node.onLoadChildren!();
          setLoadedChildren((prev) => {
            const next = new Map(prev);
            next.set(nodeId, children);
            return next;
          });

          // NOW expand the node after children are loaded
          const newExpanded = new Set(expandedNodes);
          newExpanded.add(nodeId);
          if (expanded && onExpandedChange) {
            onExpandedChange(Array.from(newExpanded));
          } else {
            setInternalExpanded(newExpanded);
          }
        } catch (error) {
          console.error(`Failed to load children for node ${nodeId}:`, error);
          loadedNodesRef.current.delete(nodeId);
        } finally {
          setLoadingNodes((prev) => {
            const next = new Set(prev);
            next.delete(nodeId);
            return next;
          });
        }
        return;
      }

      // Standard toggle for collapsing or nodes that don't need to load
      const newExpanded = new Set(expandedNodes);
      if (isCurrentlyExpanded) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }

      if (expanded && onExpandedChange) {
        onExpandedChange(Array.from(newExpanded));
      } else {
        setInternalExpanded(newExpanded);
      }
    },
    [expandedNodes, expanded, onExpandedChange, mergedData],
  );

  const checkedNodesSet = React.useMemo(() => {
    return checkedNodes ? new Set(checkedNodes) : undefined;
  }, [checkedNodes]);

  // Compute parent node map for ALL nodes (not just visible ones)
  const parentNodeMap = React.useMemo(
    () => buildParentMap(mergedData),
    [mergedData],
  );

  const { visibleNodeIds, disabledNodesMap } = React.useMemo(
    () => collectVisibleIds(mergedData, expandedNodes),
    [mergedData, expandedNodes],
  );

  // Create loading nodes map
  const loadingNodesMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    loadingNodes.forEach((id) => map.set(id, true));
    return map;
  }, [loadingNodes]);

  // Focus restoration: when data changes and focused node is removed, focus first node
  React.useEffect(() => {
    if (!lastFocusedNodeId || visibleNodeIds.includes(lastFocusedNodeId))
      return;

    const firstId = visibleNodeIds[0];
    if (firstId) {
      setLastFocusedNodeId(firstId);
      setTimeout(() => focusableNodes.current.get(firstId)?.focus(), 0);
    } else {
      setLastFocusedNodeId(null);
    }
  }, [visibleNodeIds, lastFocusedNodeId]);

  const contextValue = React.useMemo(
    () => ({
      selectedNode,
      onNodeSelect,
      expandedNodes,
      onToggleNode: handleToggleNode,
      checkedNodes: checkedNodesSet,
      onCheckedNodesChange,
      renderItem: ((item: TreeNode<Record<string, unknown>>) =>
        renderItemRef.current(item as TreeNode<TData>)) as (
        item: TreeNode<Record<string, unknown>>,
      ) => React.ReactElement,
      variant,
      showLines,
      enableBulkActions,
      disableSelection,
      focusableNodes,
      visibleNodeIds,
      disabledNodesMap,
      loadingNodesMap,
      parentNodeMap,
      lastFocusedNodeId,
      setLastFocusedNodeId,
      data: mergedData,
    }),
    [
      selectedNode,
      onNodeSelect,
      expandedNodes,
      handleToggleNode,
      checkedNodesSet,
      onCheckedNodesChange,
      variant,
      showLines,
      enableBulkActions,
      disableSelection,
      visibleNodeIds,
      disabledNodesMap,
      loadingNodesMap,
      parentNodeMap,
      lastFocusedNodeId,
      setLastFocusedNodeId,
      mergedData,
    ],
  );

  const defaultProps = {
    "data-slot": "tree",
    className: cn(
      "w-full min-w-0 text-sm",
      variant === "filled" &&
        "ring ring-border/60 ring-1 bg-muted rounded-2xl p-2 shadow-sm",
      variant === "outline" &&
        "overflow-hidden rounded-2xl ring ring-border/60 bg-card p-2 shadow-sm",
      className,
    ),
    role: "tree",
    "aria-multiselectable": enableBulkActions,
    children: (
      <TreeContext.Provider value={contextValue}>
        {mergedData.map((node, index) => (
          <TreeItemInternal
            key={node.id}
            node={node}
            depth={0}
            positionInSet={index + 1}
            setSize={mergedData.length}
          />
        ))}
      </TreeContext.Provider>
    ),
  };

  const element = useRender({
    defaultTagName: "div",
    render: render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

// ============================================================================
// Constants
// ============================================================================

const INDENT_SIZE = 20;
const INDENT_SIZE_WITH_CHECKBOX = 12;
const VERTICAL_LINE_OFFSET = 4.5;
const CHILD_VERTICAL_LINE_OFFSET = 15.5;
const BADGE_TEXT_SIZE = "text-[10px]";

// ============================================================================
// Helper Functions - Defined outside component for stable references
// ============================================================================

/**
 * Updates parent nodes based on their children's checked state.
 * A parent is checked if all its leaf descendants are checked.
 */
function updateParentCheckStates<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(nodes: TreeNode<TData>[], checkedSet: Set<string>): void {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      // Recursively update children first (bottom-up)
      updateParentCheckStates(node.children, checkedSet);

      // Get all leaf descendants of this parent
      const leafIds = getLeafNodeIds(node.children);

      // Parent should be checked if all leaf descendants are checked
      const allLeavesChecked = leafIds.every((id) => checkedSet.has(id));

      if (allLeavesChecked) {
        checkedSet.add(node.id);
      } else {
        checkedSet.delete(node.id);
      }
    }
  }
}

// ============================================================================
// Custom Hooks
// ============================================================================

interface UseTreeCheckboxStateParams<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  node: TreeNode<TData>;
  hasChildren: boolean;
  context: TreeContextValue<TData>;
}

interface UseTreeCheckboxStateReturn {
  allDescendantIds: string[];
  localChildValues: string[];
  handleLocalCheckboxChange: (newValues: string[]) => void;
}

function useTreeCheckboxState<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  node,
  hasChildren,
  context,
}: UseTreeCheckboxStateParams<TData>): UseTreeCheckboxStateReturn {
  const allDescendantIds = React.useMemo(
    () => (hasChildren ? getAllDescendantIds(node) : []),
    [hasChildren, node],
  );

  const allLeafIds = React.useMemo(
    () => (hasChildren ? getLeafNodeIds(node.children || []) : []),
    [hasChildren, node.children],
  );

  const localChildValues = React.useMemo(() => {
    if (!hasChildren || !context.checkedNodes || !context.enableBulkActions)
      return [];
    return allDescendantIds.filter((id) => context.checkedNodes!.has(id));
  }, [
    hasChildren,
    context.checkedNodes,
    allDescendantIds,
    context.enableBulkActions,
  ]);

  const handleLocalCheckboxChange = React.useCallback(
    (newValues: string[]) => {
      if (!context.onCheckedNodesChange || !context.checkedNodes) return;

      const currentSet = new Set(context.checkedNodes);

      // Remove all descendants
      for (const id of allDescendantIds) {
        currentSet.delete(id);
      }

      // Add back the selected values (these are all descendants now)
      for (const id of newValues) {
        currentSet.add(id);
      }

      // Update all parent nodes based on their children's checked state
      // This will correctly set all ancestors (parent, grandparent, etc.)
      updateParentCheckStates(context.data, currentSet);

      context.onCheckedNodesChange(Array.from(currentSet));
    },
    [context, allDescendantIds],
  );

  return {
    allDescendantIds,
    localChildValues,
    handleLocalCheckboxChange,
  };
}

// ============================================================================
// TreeItemInternal - Handles recursion internally
// ============================================================================

interface TreeItemInternalProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  node: TreeNode<TData>;
  depth: number;
  positionInSet?: number;
  setSize?: number;
}

function TreeItemInternal<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  node,
  depth,
  positionInSet,
  setSize,
}: TreeItemInternalProps<TData>): React.ReactElement {
  const context = useTreeContext<TData>();

  const hasChildren = Boolean(
    (node.children && node.children.length > 0) ||
      ("onLoadChildren" in node && node.onLoadChildren),
  );
  const isExpanded = context.expandedNodes.has(node.id);
  const isSelected = context.selectedNode === node.id;
  const isDisabled = node.disabled || false;
  const isLoading =
    context.loadingNodesMap.has(node.id) || node.loading || false;
  const isChecked =
    context.enableBulkActions && context.checkedNodes
      ? context.checkedNodes.has(node.id)
      : false;

  // Roving tabindex: only the last focused node should be tabbable
  // If no node has been focused yet, the first node is tabbable
  const isFirstNode = context.visibleNodeIds[0] === node.id;
  const isLastFocused = context.lastFocusedNodeId === node.id;
  const isTabbable =
    isLastFocused || (!context.lastFocusedNodeId && isFirstNode);

  // Create merged context value with item-level state
  const mergedContextValue = React.useMemo(
    () => ({
      ...context,
      item: node,
      depth,
      isExpanded,
      isSelected,
      hasChildren,
      isLoading,
    }),
    [context, node, depth, isExpanded, isSelected, hasChildren, isLoading],
  );

  const handleToggleChecked = React.useCallback(() => {
    if (!context.onCheckedNodesChange || !context.checkedNodes) return;

    const currentSet = new Set(context.checkedNodes);
    const allDescendantIds = hasChildren ? getAllDescendantIds(node) : [];

    if (isChecked) {
      // Uncheck this node and all descendants
      currentSet.delete(node.id);
      for (const id of allDescendantIds) {
        currentSet.delete(id);
      }
    } else {
      // Check this node and all descendants
      currentSet.add(node.id);
      for (const id of allDescendantIds) {
        currentSet.add(id);
      }
    }

    // Update all parent nodes based on their children's checked state
    updateParentCheckStates(context.data, currentSet);

    context.onCheckedNodesChange(Array.from(currentSet));
  }, [context, isChecked, node, hasChildren]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) return;
      e.stopPropagation();

      if (context.enableBulkActions) {
        handleToggleChecked();
      } else if (!context.disableSelection) {
        context.onNodeSelect?.(node.id);
      }
    },
    [context, node.id, isDisabled, handleToggleChecked],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      handleTreeKeyboardNavigation(e, {
        nodeId: node.id,
        hasChildren,
        isExpanded,
        isDisabled,
        node,
        visibleNodeIds: context.visibleNodeIds,
        disabledNodesMap: context.disabledNodesMap,
        parentNodeMap: context.parentNodeMap,
        focusableNodes: context.focusableNodes.current,
        enableBulkActions: context.enableBulkActions,
        disableSelection: context.disableSelection,
        onToggleNode: context.onToggleNode,
        onNodeSelect: context.onNodeSelect,
        setLastFocusedNodeId: context.setLastFocusedNodeId,
        handleToggleChecked,
      });
    },
    [
      node,
      hasChildren,
      isExpanded,
      isDisabled,
      context.visibleNodeIds,
      context.disabledNodesMap,
      context.parentNodeMap,
      context.focusableNodes,
      context.enableBulkActions,
      context.disableSelection,
      context.onToggleNode,
      context.onNodeSelect,
      context.setLastFocusedNodeId,
      handleToggleChecked,
    ],
  );

  const paddingLeft =
    depth *
    (context.enableBulkActions ? INDENT_SIZE_WITH_CHECKBOX : INDENT_SIZE);

  // Checkbox state management
  const { allDescendantIds, localChildValues, handleLocalCheckboxChange } =
    useTreeCheckboxState({
      node,
      hasChildren,
      context,
    });

  // Render leaf node (no children)
  if (!hasChildren) {
    return (
      <TreeContext.Provider value={mergedContextValue as TreeContextValue}>
        <div className={cn("mt-0.5 first:mt-0")}>
          <div
            className="group relative flex select-none"
            style={{ paddingLeft }}
          >
            {context.showLines && depth > 0 && (
              <div
                className="absolute top-0 bottom-0 left-0"
                style={{ left: paddingLeft - VERTICAL_LINE_OFFSET }}
              >
                <div className="bg-border h-full w-px" />
              </div>
            )}
            <div
              className={cn(
                "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                "hover:bg-accent",
                isSelected &&
                  !context.disableSelection &&
                  "bg-accent text-accent-foreground",
                isDisabled && "cursor-not-allowed opacity-50",
              )}
            >
              <div
                ref={(el) => {
                  if (el) {
                    context.focusableNodes.current.set(node.id, el);
                  } else {
                    context.focusableNodes.current.delete(node.id);
                  }
                }}
                className={cn(
                  "-my-1.5 flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 transition-colors outline-none select-none",
                  "-mx-2",
                  "focus-visible:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2",
                  !isDisabled && "cursor-pointer",
                )}
                onClick={handleClick}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.stopPropagation();
                  }
                  handleKeyDown(e);
                }}
                onFocus={() => {
                  context.setLastFocusedNodeId(node.id);
                }}
                role="treeitem"
                aria-level={depth + 1}
                aria-setsize={setSize}
                aria-posinset={positionInSet}
                aria-selected={
                  context.enableBulkActions ? undefined : isSelected
                }
                aria-checked={context.enableBulkActions ? isChecked : undefined}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
              >
                {context.enableBulkActions && (
                  <Checkbox
                    value={node.id}
                    checked={isChecked}
                    disabled={isDisabled}
                    tabIndex={-1}
                    className="pointer-events-none"
                  />
                )}
                {context.renderItem(node)}
              </div>
            </div>
          </div>
        </div>
      </TreeContext.Provider>
    );
  }

  // Render parent node (has children)

  const parentContent = (
    <TreeContext.Provider value={mergedContextValue as TreeContextValue}>
      <div
        role="treeitem"
        aria-expanded={isExpanded}
        aria-level={depth + 1}
        aria-setsize={setSize}
        aria-posinset={positionInSet}
        aria-selected={context.enableBulkActions ? undefined : isSelected}
        aria-checked={context.enableBulkActions ? isChecked : undefined}
        aria-disabled={isDisabled}
        className={cn("mt-0.5 first:mt-0")}
      >
        <BaseCollapsible.Root
          open={isExpanded}
          onOpenChange={() => !isDisabled && context.onToggleNode(node.id)}
        >
          <div
            className="group relative flex select-none"
            style={{ paddingLeft }}
          >
            {context.showLines && depth > 0 && (
              <div
                className="absolute top-0 bottom-0 left-0"
                style={{ left: paddingLeft - VERTICAL_LINE_OFFSET }}
              >
                <div className="bg-border h-full w-px" />
              </div>
            )}
            <div
              className={cn(
                "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                "hover:bg-accent",
                isSelected &&
                  !context.disableSelection &&
                  "bg-accent text-accent-foreground",
                isDisabled && "cursor-not-allowed opacity-50",
              )}
            >
              {context.enableBulkActions ? (
                // In bulk actions mode, use plain div to avoid Collapsible.Trigger keyboard handling
                <div
                  ref={(el) => {
                    if (el) {
                      context.focusableNodes.current.set(node.id, el);
                    } else {
                      context.focusableNodes.current.delete(node.id);
                    }
                  }}
                  className={cn(
                    "group/trigger -mx-2 -my-1.5 flex flex-1 items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left transition-colors outline-none select-none",
                    "focus-visible:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2",
                    !isDisabled && "cursor-pointer",
                  )}
                  onClick={() => {
                    // Clicking node text/content expands/collapses
                    if (!isDisabled) {
                      context.onToggleNode(node.id);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    context.setLastFocusedNodeId(node.id);
                  }}
                  tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
                >
                  <span
                    onClick={(e: React.MouseEvent) => {
                      // Clicking checkbox toggles checked state
                      e.stopPropagation();
                      handleToggleChecked();
                    }}
                  >
                    <Checkbox
                      parent
                      disabled={isDisabled}
                      tabIndex={-1}
                      className="pointer-events-auto cursor-pointer"
                    />
                  </span>
                  <ChevronRightIcon
                    aria-hidden="true"
                    className={cn(
                      "text-muted-foreground ease-out-cubic size-4 shrink-0 transition-transform duration-[325ms]",
                      isExpanded && "rotate-90",
                      isDisabled && "opacity-50",
                    )}
                  />
                  {context.renderItem(node)}
                </div>
              ) : (
                // In navigation/selection mode, use Collapsible.Trigger for built-in behavior
                <BaseCollapsible.Trigger
                  ref={(el) => {
                    if (el) {
                      context.focusableNodes.current.set(node.id, el);
                    } else {
                      context.focusableNodes.current.delete(node.id);
                    }
                  }}
                  className={cn(
                    "group/trigger -mx-2 -my-1.5 flex flex-1 items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left transition-colors outline-none select-none",
                    "focus-visible:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2",
                    !isDisabled && "cursor-pointer",
                  )}
                  onClick={(e) => {
                    if (!isDisabled && !context.disableSelection) {
                      handleClick(e);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    context.setLastFocusedNodeId(node.id);
                  }}
                  disabled={isDisabled}
                  tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
                >
                  <ChevronRightIcon
                    aria-hidden="true"
                    className={cn(
                      "text-muted-foreground ease-out-cubic size-4 shrink-0 transition-transform duration-[325ms]",
                      isExpanded && "rotate-90",
                      isDisabled && "opacity-50",
                    )}
                  />
                  {context.renderItem(node)}
                </BaseCollapsible.Trigger>
              )}
            </div>
          </div>

          <BaseCollapsible.Panel
            className={cn(
              "ease-out-cubic h-[var(--collapsible-panel-height)] overflow-y-clip transition-all duration-[325ms]",
              "data-[ending-style]:h-0 data-[ending-style]:opacity-0",
              "data-[starting-style]:h-0 data-[starting-style]:opacity-0",
            )}
          >
            {node.children && node.children.length > 0 && (
              <div
                className={cn(
                  context.showLines && "relative",
                  "pt-0.5 pb-0.5 pl-0",
                )}
              >
                {context.showLines && (
                  <div
                    className="bg-border absolute top-0 bottom-0 w-px"
                    style={{ left: paddingLeft + CHILD_VERTICAL_LINE_OFFSET }}
                  />
                )}
                {node.children.map((child, index) => (
                  <TreeItemInternal
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    positionInSet={index + 1}
                    setSize={node.children?.length}
                  />
                ))}
              </div>
            )}
          </BaseCollapsible.Panel>
        </BaseCollapsible.Root>
      </div>
    </TreeContext.Provider>
  );

  if (context.enableBulkActions) {
    return (
      <CheckboxGroup
        value={localChildValues}
        onValueChange={handleLocalCheckboxChange}
        allValues={allDescendantIds}
      >
        {parentContent}
      </CheckboxGroup>
    );
  }

  return parentContent;
}

// ============================================================================
// TreeItem Component (Public API)
// ============================================================================

export interface TreeItemProps extends useRender.ComponentProps<"div"> {
  children: React.ReactNode;
}

function TreeItem({
  className,
  children,
  render,
  ...props
}: TreeItemProps) {
  const defaultProps = {
    "data-slot": "tree-item",
    className: cn("flex flex-1 items-center gap-2", className),
    children,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

// ============================================================================
// TreeItemIcon Component
// ============================================================================

export interface TreeItemIconProps extends useRender.ComponentProps<"span"> {
  children?: React.ReactNode;
}

function TreeItemIcon({
  children,
  className,
  render,
  ...props
}: TreeItemIconProps) {
  const { item, isExpanded, isLoading } = useTreeItemContext();

  // Show loading spinner if node is loading
  let displayIcon: React.ReactNode;
  if (isLoading) {
    displayIcon = <Loader2Icon className="animate-spin" />;
  } else {
    displayIcon =
      isExpanded && "iconOpen" in item && item.iconOpen
        ? item.iconOpen
        : children;
  }

  if (!displayIcon) return null;

  const defaultProps = {
    "data-slot": "tree-item-icon",
    className: cn("text-muted-foreground shrink-0 [&>svg]:size-4", className),
    children: displayIcon,
  };

  const element = useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });

  return element;
}

// ============================================================================
// TreeItemLabel Component
// ============================================================================

export interface TreeItemLabelProps extends useRender.ComponentProps<"span"> {
  children: React.ReactNode;
}

function TreeItemLabel({
  children,
  className,
  render,
  ...props
}: TreeItemLabelProps) {
  if (!children) return null;

  const defaultProps = {
    "data-slot": "tree-item-label",
    className: cn("truncate", className),
    children,
  };

  const element = useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });

  return element;
}

// ============================================================================
// TreeItemBadge Component
// ============================================================================

export interface TreeItemBadgeProps extends useRender.ComponentProps<"span"> {
  children?: React.ReactNode;
}

function TreeItemBadge({
  children,
  className,
  render,
  ...props
}: TreeItemBadgeProps) {
  if (!children) return null;

  const defaultProps = {
    "data-slot": "tree-item-badge",
    className: cn(
      "ml-auto flex shrink-0 items-center",
      // Scale down badges to match tree text size and prevent height increase
      `[&_[data-slot=badge]]:py-0.5 [&_[data-slot=badge]]:${BADGE_TEXT_SIZE} [&_[data-slot=badge]]:leading-tight`,
      className,
    ),
    children,
  };

  const element = useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });

  return element;
}

// ============================================================================
// Exports
// ============================================================================

export {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeItemBadge,
  type TreeVariant,
  type TreeMode,
};

// Note: Using import + export pattern because shadcn CLI doesn't transform `export ... from` paths
import * as TreeUtils from "@/registry/default/tree/lib/tree-utils";
export { TreeUtils };
