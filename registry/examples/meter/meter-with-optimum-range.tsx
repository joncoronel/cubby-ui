import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterWithOptimumRange() {
  return (
    <MeterRoot
      value={5}
      min={0}
      max={10}
      optimumMin={4.5}
      optimumMax={5.5}
      className="w-[300px]"
    >
      <div className="flex items-center justify-between gap-2">
        <MeterLabel>Blood Sugar</MeterLabel>
        <MeterValue>{(formattedValue, value) => `${value} mmol/L`}</MeterValue>
      </div>
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
      <p className="text-muted-foreground text-xs">
        Normal range: 4.5-5.5 mmol/L
      </p>
    </MeterRoot>
  );
}
