import { Kbd } from "@/registry/default/kbd/kbd";

export default function KbdKeyCombinationsWithProps() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Kbd keys={["mod", "k"]} />
      <Kbd keys={["mod", "shift", "p"]} />
      <Kbd keys={["alt", "tab"]} />
      <Kbd keys={["mod", "k"]} separator="/" />
    </div>
  );
}
