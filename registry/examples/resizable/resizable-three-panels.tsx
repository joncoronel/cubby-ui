import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/default/resizable/resizable";

export default function ResizableThreePanels() {
  return (
    <ResizablePanelGroup className="h-56 max-w-lg rounded-xl border">
      <ResizablePanel defaultSize="25%" minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Left</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="50%" minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Middle</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="25%" minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Right</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
