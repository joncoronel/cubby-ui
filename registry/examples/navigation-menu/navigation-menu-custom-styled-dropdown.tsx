import Link from "next/link";
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/registry/default/navigation-menu/navigation-menu";

export default function NavigationMenuCustomStyledDropdown() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <div className="grid gap-1">
                <h4 className="font-medium leading-none mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  For Developers
                </h4>
                <NavigationMenuLink
                  href="/api"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      API
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">REST API</div>
                    <div className="text-sm text-muted-foreground">
                      Build with our API
                    </div>
                  </div>
                </NavigationMenuLink>
              </div>
              <div className="grid gap-1">
                <h4 className="font-medium leading-none mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  For Teams
                </h4>
                <NavigationMenuLink
                  href="/enterprise"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      ENT
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Enterprise</div>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Advanced features for teams
                    </div>
                  </div>
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 md:w-[400px] lg:w-[500px]">
              <div className="grid gap-2">
                <h4 className="font-medium leading-none mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  Learn & Support
                </h4>
                <NavigationMenuLink
                  render={
                    <Link
                      href="/docs"
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          📚
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">Documentation</div>
                        <div className="text-sm text-muted-foreground">
                          Complete guides and references
                        </div>
                      </div>
                    </Link>
                  }
                />
                <NavigationMenuLink
                  render={
                    <Link
                      href="/community"
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          👥
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">Community</div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Join our developer community
                        </div>
                      </div>
                    </Link>
                  }
                />
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}