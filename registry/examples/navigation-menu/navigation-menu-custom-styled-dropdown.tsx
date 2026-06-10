import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
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
                <h4 className="text-muted-foreground mb-2 text-sm leading-none font-medium tracking-wide uppercase">
                  For Developers
                </h4>
                <NavigationMenuLink
                  href="/api"
                  className="hover:bg-surface-hover flex items-center gap-3 rounded-md p-2"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <span className="text-sm font-bold text-white">API</span>
                  </div>
                  <div>
                    <div className="font-medium">REST API</div>
                    <div className="text-muted-foreground text-sm">
                      Build with our API
                    </div>
                  </div>
                </NavigationMenuLink>
              </div>
              <div className="grid gap-1">
                <h4 className="text-muted-foreground mb-2 text-sm leading-none font-medium tracking-wide uppercase">
                  For Teams
                </h4>
                <NavigationMenuLink
                  href="/enterprise"
                  className="hover:bg-surface-hover flex items-center gap-3 rounded-md p-2"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                    <span className="text-sm font-bold text-white">ENT</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Enterprise</div>
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                        New
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm">
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
                <h4 className="text-muted-foreground mb-2 text-sm leading-none font-medium tracking-wide uppercase">
                  Learn & Support
                </h4>
                <NavigationMenuLink
                  render={
                    <Link
                      href="/docs"
                      className="hover:bg-surface-hover flex items-center gap-3 rounded-md p-2"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                        <span className="text-sm font-bold text-white">📚</span>
                      </div>
                      <div>
                        <div className="font-medium">Documentation</div>
                        <div className="text-muted-foreground text-sm">
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
                      className="hover:bg-surface-hover flex items-center gap-3 rounded-md p-2"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                        <span className="text-sm font-bold text-white">👥</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">Community</div>
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                            Active
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
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
