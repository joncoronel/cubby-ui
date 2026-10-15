import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuEmpty,
  ContextMenuFilter,
  ContextMenuInput,
  ContextMenuItem,
  ContextMenuList,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/default/context-menu/context-menu";

const folders = [
  "Archive",
  "Clients",
  "Contracts",
  "Design",
  "Finance",
  "Invoices",
  "Personal",
  "Receipts",
];

export default function ContextMenuWithFilter() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          Open <ContextMenuShortcut>⌘O</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Rename <ContextMenuShortcut>⏎</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuFilter>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56 p-0">
              <ContextMenuInput
                aria-label="Search folders"
                placeholder="Search folders..."
              />
              <ContextMenuEmpty>No matching folders.</ContextMenuEmpty>
              <ContextMenuList>
                {folders.map((folder) => (
                  <ContextMenuItem key={folder}>{folder}</ContextMenuItem>
                ))}
              </ContextMenuList>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuFilter>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          Delete <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
