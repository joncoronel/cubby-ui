import { Kbd } from "@/registry/default/kbd/kbd";

export default function KbdSizeVariants() {
  return (
    <div className="flex items-center gap-4">
      <Kbd size="sm" keys={["mod", "k"]} />
      <Kbd size="md" keys={["mod", "k"]} />
      <Kbd size="lg" keys={["mod", "k"]} />
    </div>
  );
}
