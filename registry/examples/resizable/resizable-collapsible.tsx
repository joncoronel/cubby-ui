"use client";

import * as React from "react";
import {
  Calendar03Icon,
  InboxIcon,
  Search01Icon,
  Settings01Icon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/registry/default/button/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
} from "@/registry/default/resizable/resizable";

const NAV_ITEMS = [
  { label: "Inbox", icon: InboxIcon },
  { label: "Search", icon: Search01Icon },
  { label: "Calendar", icon: Calendar03Icon },
  { label: "Settings", icon: Settings01Icon },
];

export default function ResizableCollapsible() {
  const sidebarRef = usePanelRef();
  const [collapsed, setCollapsed] = React.useState(false);

  function toggleSidebar() {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    if (sidebar.isCollapsed()) sidebar.expand();
    else sidebar.collapse();
  }

  return (
    <ResizablePanelGroup className="h-64 max-w-lg rounded-xl border">
      <ResizablePanel
        panelRef={sidebarRef}
        defaultSize={180}
        minSize={140}
        maxSize={260}
        collapsible
        collapsedSize={52}
        collapsedThreshold={24}
        onResize={() =>
          setCollapsed(sidebarRef.current?.isCollapsed() ?? false)
        }
      >
        <nav aria-label="Sidebar" className="flex flex-col gap-0.5 p-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              aria-label={collapsed ? item.label : undefined}
              className="text-muted-foreground hover:bg-surface-hover hover:text-foreground flex h-9 items-center gap-2.5 overflow-hidden rounded-lg px-2.5 text-sm font-medium"
            >
              <HugeiconsIcon
                icon={item.icon}
                strokeWidth={2}
                className="size-4 shrink-0"
              />
              <span
                className={
                  collapsed
                    ? "opacity-0"
                    : "truncate opacity-100 transition-opacity delay-150 duration-200 motion-reduce:transition-none"
                }
              >
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize="40%">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b p-2">
            <Button
              variant="ghost"
              size="icon_sm"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
            </Button>
            <span className="text-sm font-medium">Inbox</span>
          </div>
          <p className="text-muted-foreground p-4 text-sm text-pretty">
            Drag the sidebar past its minimum to collapse it, or use the toggle.
            Double-click the handle to reset.
          </p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
