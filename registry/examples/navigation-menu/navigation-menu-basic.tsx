import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/registry/default/navigation-menu/navigation-menu";

export default function NavigationMenuBasic() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid max-w-[500px] gap-3 sm:grid-cols-2">
              <li className="row-span-3">
                <NavigationMenuLink
                  className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
                  href="/"
                >
                  <div className="mt-4 mb-2 text-lg font-medium">
                    Featured Product
                  </div>
                  <p className="text-muted-foreground text-sm leading-tight">
                    Discover our latest innovation in productivity tools.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/products/analytics">
                  <div className="text-sm leading-none font-medium">
                    Analytics
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    Real-time insights and data visualization
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/products/automation">
                  <div className="text-sm leading-none font-medium">
                    Automation
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    Streamline your workflow with AI
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/products/security">
                  <div className="text-sm leading-none font-medium">
                    Security
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    Enterprise-grade protection
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid max-w-[400px] gap-3">
              <li>
                <NavigationMenuLink href="/solutions/startups">
                  <div className="text-sm leading-none font-medium">
                    For Startups
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    Scale fast with our startup-friendly tools
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/solutions/enterprise">
                  <div className="text-sm leading-none font-medium">
                    For Enterprise
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    Robust solutions for large organizations
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/solutions/developers">
                  <div className="text-sm leading-none font-medium">
                    For Developers
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                    APIs and SDKs to build amazing apps
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
