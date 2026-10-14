import {
  Menubar,
  MenubarContent,
  MenubarEmpty,
  MenubarFilter,
  MenubarGroup,
  MenubarGroupLabel,
  MenubarInput,
  MenubarItem,
  MenubarList,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/default/menubar/menubar";

export default function MenubarWithFilter() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarFilter>
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent className="w-64">
            <MenubarInput aria-label="Search help" placeholder="Search..." />
            <MenubarEmpty>No matching topics.</MenubarEmpty>
            <MenubarList>
              <MenubarGroup>
                <MenubarGroupLabel>Getting started</MenubarGroupLabel>
                <MenubarItem>Create a project</MenubarItem>
                <MenubarItem>Invite your team</MenubarItem>
                <MenubarItem>Import from CSV</MenubarItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarGroupLabel>Support</MenubarGroupLabel>
                <MenubarItem>
                  Keyboard shortcuts <MenubarShortcut>⌘/</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>Release notes</MenubarItem>
                <MenubarItem>Contact support</MenubarItem>
              </MenubarGroup>
            </MenubarList>
          </MenubarContent>
        </MenubarMenu>
      </MenubarFilter>
    </Menubar>
  );
}
