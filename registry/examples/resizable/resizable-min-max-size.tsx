import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/default/resizable/resizable";

export default function ResizableMinMaxSize() {
  return (
    <ResizablePanelGroup className="h-56 max-w-lg rounded-xl border">
      <ResizablePanel defaultSize={200} minSize={160} maxSize={280}>
        <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-sm font-medium">Sidebar</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            160 to 280px
          </span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize="40%">
        <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-sm font-medium">Main</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            At least 40%
          </span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
