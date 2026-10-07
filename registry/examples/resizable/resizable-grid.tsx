import {
  ResizableCell,
  ResizableGrid,
  ResizableGridline,
} from "@/registry/default/resizable/resizable";

export default function ResizableGridExample() {
  return (
    <ResizableGrid
      columns={[{ minSize: 96 }, { minSize: 96 }]}
      rows={[{ minSize: 64 }, { minSize: 64 }]}
      className="h-72 max-w-lg rounded-xl border"
    >
      <ResizableCell column={0} row={0}>
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Files</span>
        </div>
      </ResizableCell>
      <ResizableCell column={1} row={0}>
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Editor</span>
        </div>
      </ResizableCell>
      <ResizableCell column={0} row={1}>
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Outline</span>
        </div>
      </ResizableCell>
      <ResizableCell column={1} row={1}>
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-medium">Terminal</span>
        </div>
      </ResizableCell>
      <ResizableGridline type="column" column={1} />
      <ResizableGridline type="row" row={1} />
    </ResizableGrid>
  );
}
