"use client";

import * as React from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDefaultLayout,
} from "@/registry/default/resizable/resizable";

// Stands in for localStorage on the server and during hydration, so the first
// client render matches the server's HTML.
const NOOP_STORAGE = {
  getItem: () => null,
  setItem: () => {},
};

const subscribe = () => () => {};

export default function ResizablePersistent() {
  const hydrated = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  // Reads the saved layout and writes it back after each resize.
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "cubby-resizable-persistent",
    storage: hydrated ? localStorage : NOOP_STORAGE,
  });

  return (
    <ResizablePanelGroup
      // A default layout only applies on mount, so remount once the saved
      // one can be read.
      key={hydrated ? "client" : "server"}
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
      className="h-56 max-w-md rounded-xl border"
    >
      <ResizablePanel id="list" defaultSize="40%" minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">List</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="detail" minSize="30%">
        <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-sm font-medium">Detail</span>
          <span className="text-muted-foreground text-xs">
            Resize, then reload the page
          </span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
