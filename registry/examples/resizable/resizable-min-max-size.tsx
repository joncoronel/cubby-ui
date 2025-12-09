import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/registry/default/resizable/resizable";

export default function ResizableMinMaxSize() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold text-center">
            Sidebar
            <br />
            <small className="text-xs text-muted-foreground">
              15-30%
            </small>
          </span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold text-center">
            Main Content
            <br />
            <small className="text-xs text-muted-foreground">
              Min 50%
            </small>
          </span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}