import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <MeterRoot key={size} value={58} size={size}>
          <MeterLabel className="capitalize">{size}</MeterLabel>
          <MeterValue />
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>
      ))}
    </div>
  );
}
