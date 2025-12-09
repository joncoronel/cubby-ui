import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuSubTrigger,
  NavigationMenuSub,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/registry/default/navigation-menu/navigation-menu";

export default function NavigationMenuNestedSubmenus() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid list-none grid-cols-1 gap-0 sm:grid-cols-[12rem_12rem]">
              <li>
                <NavigationMenuLink
                  href="/docs/quick-start"
                  className="block rounded-md p-2 xs:p-3 no-underline text-inherit hover:bg-accent hover:text-accent-foreground"
                >
                  <h3 className="mb-1 text-base leading-5 font-medium">
                    Quick Start
                  </h3>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Install and assemble your first component.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="/docs/accessibility"
                  className="block rounded-md p-2 xs:p-3 no-underline text-inherit hover:bg-accent hover:text-accent-foreground"
                >
                  <h3 className="mb-1 text-base leading-5 font-medium">
                    Accessibility
                  </h3>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Learn how we build accessible components.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuSub orientation="vertical">
                  <NavigationMenuItem>
                    <NavigationMenuSubTrigger>
                      <span className="mb-1 text-base leading-5 font-medium">
                        Handbook
                      </span>
                      <p className="text-sm leading-5 text-muted-foreground">
                        How to use Base UI effectively.
                      </p>
                    </NavigationMenuSubTrigger>
                    <NavigationMenuContent>
                      <ul className="flex max-w-[400px] flex-col justify-center">
                        <li>
                          <NavigationMenuLink
                            href="/handbook/styling"
                            className="block rounded-md p-2 xs:p-3 no-underline text-inherit hover:bg-accent hover:text-accent-foreground"
                          >
                            <h3 className="mb-1 text-base leading-5 font-medium">
                              Styling
                            </h3>
                            <p className="text-sm leading-5 text-muted-foreground">
                              Style components with CSS or Tailwind.
                            </p>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink
                            href="/handbook/animation"
                            className="block rounded-md p-2 xs:p-3 no-underline text-inherit hover:bg-accent hover:text-accent-foreground"
                          >
                            <h3 className="mb-1 text-base leading-5 font-medium">
                              Animation
                            </h3>
                            <p className="text-sm leading-5 text-muted-foreground">
                              Animate with CSS or JavaScript libraries.
                            </p>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink
                            href="/handbook/composition"
                            className="block rounded-md p-2 xs:p-3 no-underline text-inherit hover:bg-accent hover:text-accent-foreground"
                          >
                            <h3 className="mb-1 text-base leading-5 font-medium">
                              Composition
                            </h3>
                            <p className="text-sm leading-5 text-muted-foreground">
                              Replace and compose with existing components.
                            </p>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuSub>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}