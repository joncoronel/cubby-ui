import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/default/resizable/resizable";

export default function ResizableGap() {
  return (
    <ResizablePanelGroup className="bg-muted h-64 max-w-lg rounded-[18px] p-1.5">
      <ResizablePanel
        defaultSize="35%"
        minSize={120}
        className="bg-background rounded-xl"
      >
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Inbox</span>
        </div>
      </ResizablePanel>
      <ResizableHandle variant="gap" />
      <ResizablePanel minSize={160}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel className="bg-background rounded-xl" minSize="15%">
            <div className="flex h-full items-center justify-center">
              <span className="text-sm font-medium">Message</span>
            </div>
          </ResizablePanel>
          <ResizableHandle variant="gap" />
          <ResizablePanel
            defaultSize="35%"
            minSize={64}
            className="bg-background rounded-xl"
          >
            <div className="flex h-full items-center justify-center">
              <span className="text-sm font-medium">Reply</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
