import { Kbd } from "@/registry/default/kbd/kbd";

export default function KbdPlatformDetection() {
  return (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-3 text-sm">
      <span className="text-muted-foreground">Auto</span>
      <Kbd keys={["mod", "shift", "p"]} className="justify-self-start" />
      <span className="text-muted-foreground">Mac</span>
      <Kbd
        keys={["mod", "shift", "p"]}
        platform="mac"
        className="justify-self-start"
      />
      <span className="text-muted-foreground">Windows</span>
      <Kbd
        keys={["mod", "shift", "p"]}
        platform="windows"
        className="justify-self-start"
      />
    </div>
  );
}
