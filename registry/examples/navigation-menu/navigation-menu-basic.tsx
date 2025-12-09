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
            <ul className="grid w-[400px] gap-3 md:w-[500px] md:grid-cols-2">
              <li className="row-span-3">
                <NavigationMenuLink
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href="/"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">
                    Featured Product
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    Discover our latest innovation in productivity tools.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/products/analytics">
                  <div className="text-sm font-medium leading-none">Analytics</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Real-time insights and data visualization
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/products/automation">
                  <div className="text-sm font-medium leading-none">Automation</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Streamline your workflow with AI
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/products/security">
                  <div className="text-sm font-medium leading-none">Security</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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
            <ul className="grid w-[400px] gap-3">
              <li>
                <NavigationMenuLink href="/solutions/startups">
                  <div className="text-sm font-medium leading-none">For Startups</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Scale fast with our startup-friendly tools
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/solutions/enterprise">
                  <div className="text-sm font-medium leading-none">For Enterprise</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Robust solutions for large organizations
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/solutions/developers">
                  <div className="text-sm font-medium leading-none">For Developers</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
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