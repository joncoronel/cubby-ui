"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { CheckboxGroup } from "@base-ui/react/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRightIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { solidSurface } from "@/registry/default/lib/elevated";
import {
  getAllDescendantIds,
  getLeafNodeIds,
  buildParentMap,
  collectVisibleIds,
  handleTreeKeyboardNavigation,
} from "./lib/tree-utils";
import * as TreeUtils from "./lib/tree-utils";

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
type TreeSize = "default" | "sm";
type TreeMode = "single" | "multiple" | "none";

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
  size: TreeSize;
  /** Some node has children, so leaves keep the chevron's room. */
  hasParents: boolean;
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
  /** Row density: `sm` for compact trees such as a file explorer. */
  size?: TreeSize;
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
  size = "default",
  showLines = false,
  mode = "single",
  className,
  render,
  ...props
}: TreeProps<TData>): React.ReactElement {
  const enableBulkActions = mode === "multiple";
  const disableSelection = mode === "none";

  const renderItemRef = React.useRef(renderItem);
  renderItemRef.current = renderItem;

  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpanded),
  );

  const focusableNodes = React.useRef<Map<string, HTMLElement>>(new Map());
  const [lastFocusedNodeId, setLastFocusedNodeId] = React.useState<
    string | null
  >(null);

  const [loadingNodes, setLoadingNodes] = React.useState<Set<string>>(
    () => new Set(),
  );

  const loadedNodesRef = React.useRef<Set<string>>(new Set());

  const [loadedChildren, setLoadedChildren] = React.useState<
    Map<string, TreeNode<TData>[]>
  >(() => new Map());

  const expandedNodes = React.useMemo(() => {
    return expanded ? new Set(expanded) : internalExpanded;
  }, [expanded, internalExpanded]);

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

  const parentNodeMap = React.useMemo(
    () => buildParentMap(mergedData),
    [mergedData],
  );

  const { visibleNodeIds, disabledNodesMap } = React.useMemo(
    () => collectVisibleIds(mergedData, expandedNodes),
    [mergedData, expandedNodes],
  );

  // Leaves at any level sit beside folders or under one, so one parent
  // anywhere means a top-level one.
  const hasParents = React.useMemo(
    () =>
      mergedData.some(
        (node) =>
          (node.children && node.children.length > 0) ||
          ("onLoadChildren" in node && Boolean(node.onLoadChildren)),
      ),
    [mergedData],
  );

  const loadingNodesMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    loadingNodes.forEach((id) => map.set(id, true));
    return map;
  }, [loadingNodes]);

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
      size,
      hasParents,
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
      size,
      hasParents,
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
        cn("rounded-2xl p-2", solidSurface(3, 2), "bg-muted"),
      variant === "outline" &&
        cn("overflow-hidden rounded-2xl p-2", solidSurface(3, 2)),
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
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

/**
 * Each level indents by exactly the chevron and its gap, so a child's
 * chevron sits under its parent's icon: the alignment that makes nesting
 * read at a glance. (A shorter step, tried for compact trees, left a child
 * folder looking like its parent's sibling.)
 */
const INDENT_SIZE = { default: 14 + 8, sm: 14 + 6 } as const;
const INDENT_SIZE_WITH_CHECKBOX = 12;
/** A row's inline padding and half its 14px chevron: the guide line's x. */
const LINE_OFFSET = { default: 8 + 7, sm: 6 + 7 } as const;
const BADGE_TEXT_SIZE = "text-[10px]";

/**
 * Updates parent nodes based on their children's checked state.
 * A parent is checked if all its leaf descendants are checked.
 */
function updateParentCheckStates<
  TData extends Record<string, unknown> = Record<string, unknown>,
>(nodes: TreeNode<TData>[], checkedSet: Set<string>): void {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      updateParentCheckStates(node.children, checkedSet);

      const leafIds = getLeafNodeIds(node.children);
      const allLeavesChecked = leafIds.every((id) => checkedSet.has(id));

      if (allLeavesChecked) {
        checkedSet.add(node.id);
      } else {
        checkedSet.delete(node.id);
      }
    }
  }
}

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

      for (const id of allDescendantIds) {
        currentSet.delete(id);
      }

      for (const id of newValues) {
        currentSet.add(id);
      }

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

  // Roving tabindex: last focused node is tabbable; first node if none focused yet.
  const isFirstNode = context.visibleNodeIds[0] === node.id;
  const isLastFocused = context.lastFocusedNodeId === node.id;
  const isTabbable =
    isLastFocused || (!context.lastFocusedNodeId && isFirstNode);

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
      currentSet.delete(node.id);
      for (const id of allDescendantIds) {
        currentSet.delete(id);
      }
    } else {
      currentSet.add(node.id);
      for (const id of allDescendantIds) {
        currentSet.add(id);
      }
    }

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
        focusableNodes: context.focusableNodes,
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

  const indent =
    depth *
    (context.enableBulkActions
      ? INDENT_SIZE_WITH_CHECKBOX
      : INDENT_SIZE[context.size]);

  const { allDescendantIds, localChildValues, handleLocalCheckboxChange } =
    useTreeCheckboxState({
      node,
      hasChildren,
      context,
    });

  // The children's group sits beside the row rather than inside it, so the
  // row names it as its own, once the group is rendered (children that are
  // still loading have none yet).
  const groupId = React.useId();
  const ownsGroup = isExpanded && Boolean(node.children?.length);

  const setFocusable = (el: HTMLElement | null): void => {
    if (el) {
      context.focusableNodes.current.set(node.id, el);
    } else {
      context.focusableNodes.current.delete(node.id);
    }
  };

  const tabIndex = isDisabled ? -1 : isTabbable ? 0 : -1;

  // One element per row: it is the tree item, takes focus and carries hover
  // and selection (two nested ones, pulled together with negative margins,
  // used to split the job). Hover lands at once; the focus ring sits inside
  // the row rather than over its neighbours.
  const rowClassName = cn(
    "flex min-w-0 flex-1 items-center rounded-md border-0 bg-transparent text-left select-none",
    context.size === "sm"
      ? "h-7 gap-1.5 px-1.5 text-[0.8125rem]"
      : "h-8 gap-2 px-2 text-sm",
    "hover:bg-surface-hover",
    "focus-visible:outline-ring/50 outline-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2",
    isSelected &&
      !context.disableSelection &&
      "bg-surface-selected text-foreground",
    isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
  );

  const itemAria = {
    role: "treeitem",
    "aria-level": depth + 1,
    "aria-setsize": setSize,
    "aria-posinset": positionInSet,
    "aria-selected": context.enableBulkActions ? undefined : isSelected,
    "aria-checked": context.enableBulkActions ? isChecked : undefined,
    "aria-disabled": isDisabled,
  } as const;

  // Leaves keep the chevron's room, so every label at a level lines up
  // (they used to start where a folder's chevron does). Outside the row, so
  // a leaf's highlight starts at its content, not at an empty strip; inside
  // it only in bulk mode, where the checkboxes lead and must line up too.
  const leafRoom =
    !hasChildren && context.hasParents && !context.enableBulkActions
      ? INDENT_SIZE[context.size]
      : 0;
  const chevronSlot = hasChildren ? (
    <HugeiconsIcon
      icon={ChevronRightIcon}
      aria-hidden="true"
      strokeWidth={2}
      className={cn(
        "text-muted-foreground ease-out-expo size-3.5 shrink-0 transition-[rotate] duration-200",
        isExpanded && "rotate-90",
      )}
    />
  ) : context.hasParents && context.enableBulkActions ? (
    <span aria-hidden="true" className="size-3.5 shrink-0" />
  ) : null;

  if (!hasChildren) {
    return (
      <TreeContext.Provider value={mergedContextValue as TreeContextValue}>
        <div
          role="none"
          className="mt-0.5 flex first:mt-0"
          style={{ paddingLeft: indent + leafRoom }}
        >
          <div
            ref={setFocusable}
            {...itemAria}
            tabIndex={tabIndex}
            className={rowClassName}
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
            {chevronSlot}
            {context.renderItem(node)}
          </div>
        </div>
      </TreeContext.Provider>
    );
  }

  const parentContent = (
    <TreeContext.Provider value={mergedContextValue as TreeContextValue}>
      <div role="none" className="mt-0.5 first:mt-0">
        <BaseCollapsible.Root
          open={isExpanded}
          onOpenChange={() => !isDisabled && context.onToggleNode(node.id)}
        >
          <div role="none" className="flex" style={{ paddingLeft: indent }}>
            {context.enableBulkActions ? (
              // Plain div in bulk-actions mode: avoids Collapsible.Trigger's
              // built-in keyboard handling.
              <div
                ref={setFocusable}
                {...itemAria}
                aria-expanded={isExpanded}
                aria-owns={ownsGroup ? groupId : undefined}
                tabIndex={tabIndex}
                className={rowClassName}
                onClick={() => {
                  if (!isDisabled) {
                    context.onToggleNode(node.id);
                  }
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  context.setLastFocusedNodeId(node.id);
                }}
              >
                <span
                  onClick={(e: React.MouseEvent) => {
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
                {chevronSlot}
                {context.renderItem(node)}
              </div>
            ) : (
              <BaseCollapsible.Trigger
                ref={setFocusable}
                {...itemAria}
                aria-owns={ownsGroup ? groupId : undefined}
                className={rowClassName}
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
                tabIndex={tabIndex}
              >
                {chevronSlot}
                {context.renderItem(node)}
              </BaseCollapsible.Trigger>
            )}
          </div>

          <BaseCollapsible.Panel
            className={cn(
              "ease-out-expo h-(--collapsible-panel-height) overflow-y-clip transition-[height,opacity] duration-250",
              "data-ending-style:h-0 data-ending-style:opacity-0",
              "data-starting-style:h-0 data-starting-style:opacity-0",
            )}
          >
            {node.children && node.children.length > 0 && (
              <div id={groupId} role="group" className="relative pt-0.5">
                {/* One guide line per group, under the parent's chevron. */}
                {context.showLines && (
                  <div
                    aria-hidden="true"
                    className="bg-border absolute top-0.5 bottom-0 w-px"
                    style={{ left: indent + LINE_OFFSET[context.size] }}
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

export interface TreeItemProps extends useRender.ComponentProps<"div"> {
  children: React.ReactNode;
}

function TreeItem({ className, children, render, ...props }: TreeItemProps) {
  const defaultProps = {
    "data-slot": "tree-item",
    // min-w-0, or a long label can't shrink below its text to truncate.
    className: cn("flex min-w-0 flex-1 items-center gap-2", className),
    children,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

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

  let displayIcon: React.ReactNode;
  if (isLoading) {
    displayIcon = (
      <HugeiconsIcon
        icon={Loading03Icon}
        className="animate-spin"
        strokeWidth={2}
      />
    );
  } else {
    displayIcon =
      isExpanded && "iconOpen" in item && item.iconOpen
        ? item.iconOpen
        : children;
  }

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

  if (!displayIcon) return null;

  return element;
}

export interface TreeItemLabelProps extends useRender.ComponentProps<"span"> {
  children: React.ReactNode;
}

function TreeItemLabel({
  children,
  className,
  render,
  ...props
}: TreeItemLabelProps) {
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

  if (!children) return null;

  return element;
}

export interface TreeItemBadgeProps extends useRender.ComponentProps<"span"> {
  children?: React.ReactNode;
}

function TreeItemBadge({
  children,
  className,
  render,
  ...props
}: TreeItemBadgeProps) {
  const defaultProps = {
    "data-slot": "tree-item-badge",
    className: cn(
      "ml-auto flex shrink-0 items-center",
      // Shrink badge text/padding to tree row height without reflowing it.
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

  if (!children) return null;

  return element;
}

export {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  TreeItemBadge,
  type TreeVariant,
  type TreeSize,
  type TreeMode,
};

export { TreeUtils };
