import { MarchingBorder } from "@/registry/default/marching-border/marching-border";

type Variant = {
  label: string;
  color: string;
  dash: number;
  gap: number;
  duration: number;
  strokeWidth?: number;
};

const VARIANTS: Variant[] = [
  {
    label: "Default",
    color: "text-primary",
    dash: 1,
    gap: 0.75,
    duration: 0.75,
  },
  {
    label: "Fine + fast",
    color: "text-foreground",
    dash: 0.6,
    gap: 0.6,
    duration: 0.2,
    strokeWidth: 1,
  },
  {
    label: "Chunky + slow",
    color: "text-destructive",
    dash: 2,
    gap: 1.5,
    duration: 1.6,
    strokeWidth: 3,
  },
];

export default function MarchingBorderVariants() {
  return (
    <div className="grid w-[420px] grid-cols-1 gap-3 sm:grid-cols-3">
      {VARIANTS.map((v) => (
        <div
          key={v.label}
          className="bg-card text-foreground relative flex aspect-square items-center justify-center rounded-lg border text-xs"
        >
          <span className="text-muted-foreground">{v.label}</span>
          <MarchingBorder
            className={v.color}
            dash={v.dash}
            gap={v.gap}
            duration={v.duration}
            strokeWidth={v.strokeWidth}
          />
        </div>
      ))}
    </div>
  );
}
