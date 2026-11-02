import { Kbd } from "@/registry/default/kbd/kbd";

export default function KbdVariants() {
  return (
    <div className="flex items-center gap-4">
      <Kbd variant="default" keys={["mod", "k"]} />
      <Kbd variant="outline" keys={["mod", "k"]} />
      <Kbd variant="ghost" keys={["mod", "k"]} />
    </div>
  );
}
