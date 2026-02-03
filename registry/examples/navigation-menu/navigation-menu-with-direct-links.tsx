import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/registry/default/navigation-menu/navigation-menu";

export default function NavigationMenuWithDirectLinks() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid max-w-[400px] gap-3">
              <li>
                <NavigationMenuLink href="/features/analytics">
                  <div className="text-sm font-medium leading-none">Analytics</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Track user behavior and measure performance
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/features/integrations">
                  <div className="text-sm font-medium leading-none">Integrations</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Connect with your favorite tools
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid max-w-[200px] gap-3">
              <li>
                <NavigationMenuLink href="/about">About</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/team">Team</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/careers">Careers</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        {/* Direct links styled as triggers */}
        <NavigationMenuItem>
          <NavigationMenuLink href="/pricing" standalone>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs" standalone>
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}