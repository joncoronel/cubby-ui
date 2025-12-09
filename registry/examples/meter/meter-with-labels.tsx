import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterWithLabels() {
  return (
    <div className="w-full max-w-[300px] space-y-4">
      <MeterRoot value={4.2} min={0} max={5}>
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Product Rating</MeterLabel>
          <MeterValue>
            {(formattedValue, value) => `${value}/5 stars`}
          </MeterValue>
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      <MeterRoot value={1536} min={0} max={2048}>
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Memory Usage</MeterLabel>
          <MeterValue>
            {(formattedValue, value) => `${value}MB / 2048MB`}
          </MeterValue>
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
