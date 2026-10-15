import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuFilter,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuList,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Button } from "@/registry/default/button/button";

const projects = [
  "Design System",
  "Marketing Site",
  "Mobile App",
  "Billing",
  "Onboarding",
  "Analytics",
  "Search",
  "Notifications",
  "Integrations",
  "Developer API",
  "Help Center",
  "Admin Console",
];

export default function DropdownMenuWithFilter() {
  return (
    <DropdownMenuFilter>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Actions
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" viewportClassName="p-0">
          <DropdownMenuInput
            aria-label="Search actions"
            placeholder="Search actions..."
          />
          <DropdownMenuEmpty>No matching actions.</DropdownMenuEmpty>
          <DropdownMenuList>
            <DropdownMenuGroup>
              <DropdownMenuGroupLabel>Issue</DropdownMenuGroupLabel>
              <DropdownMenuItem>
                Assign to me
                <DropdownMenuShortcut>I</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Change status
                <DropdownMenuShortcut>S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Set priority
                <DropdownMenuShortcut>P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Add label
                <DropdownMenuShortcut>L</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Set due date
                <DropdownMenuShortcut>D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Add estimate
                <DropdownMenuShortcut>E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuFilter>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Move to project
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    className="w-56"
                    viewportClassName="p-0"
                  >
                    <DropdownMenuInput
                      aria-label="Search projects"
                      placeholder="Search projects..."
                    />
                    <DropdownMenuEmpty>No matching projects.</DropdownMenuEmpty>
                    <DropdownMenuList>
                      {projects.map((project) => (
                        <DropdownMenuItem key={project}>
                          {project}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuList>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuFilter>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Copy ID</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Subscribe</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuList>
        </DropdownMenuContent>
      </DropdownMenu>
    </DropdownMenuFilter>
  );
}
