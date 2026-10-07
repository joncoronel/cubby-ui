import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/default/resizable/resizable";

export default function ResizableVertical() {
  return (
    <ResizablePanelGroup
      orientation="vertical"
      className="h-64 max-w-md rounded-xl border"
    >
      <ResizablePanel defaultSize="30%" minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Header</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
