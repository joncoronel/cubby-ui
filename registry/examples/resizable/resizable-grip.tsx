import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/default/resizable/resizable";

export default function ResizableGrip() {
  return (
    <ResizablePanelGroup className="h-56 max-w-md rounded-xl border">
      <ResizablePanel minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle variant="grip" />
      <ResizablePanel minSize="15%">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Two</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
