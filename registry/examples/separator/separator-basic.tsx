import { Separator } from "@/registry/default/separator/separator";

export default function SeparatorBasic() {
  return (
    <div className="w-[400px]">
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Cubby UI</h4>
        <p className="text-muted-foreground text-sm">
          A modern UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Get Started</h4>
        <p className="text-muted-foreground text-sm">
          Install and configure components in your project.
        </p>
      </div>
    </div>
  );
}
