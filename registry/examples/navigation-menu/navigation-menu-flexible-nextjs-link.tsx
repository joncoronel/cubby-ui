import Link from "next/link";
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from "@/registry/default/navigation-menu/navigation-menu";

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink
        render={
          <Link href={href} className="flex flex-col gap-2 no-underline">
            <div className="text-sm leading-none font-medium">{title}</div>
            <p className="text-muted-foreground line-clamp-2 flex text-sm leading-snug">
              {children}
            </p>
          </Link>
        }
      />
    </li>
  );
}

export default function NavigationMenuFlexibleNextjsLink() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink
                  render={
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Navigation Menu
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Beautiful navigation components with Base UI and
                        Tailwind CSS.
                      </p>
                    </Link>
                  }
                />
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Base UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid max-w-[600px] gap-3 sm:grid-cols-2">
              <ListItem href="/components/button" title="Button">
                Trigger actions and events with button components.
              </ListItem>
              <ListItem href="/components/card" title="Card">
                Display content in a structured and organized way.
              </ListItem>
              <ListItem href="/components/dialog" title="Dialog">
                Modal dialogs for user interactions and confirmations.
              </ListItem>
              <ListItem href="/components/input" title="Input">
                Collect user input with various input components.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}