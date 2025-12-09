import { Separator } from "@/registry/default/separator/separator";

export default function SeparatorVariants() {
  return (
    <div className="w-[400px] space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">Default</p>
        <Separator />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Thick</p>
        <Separator variant="thick" />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Dashed</p>
        <Separator variant="dashed" />
      </div>
    </div>
  );
}
