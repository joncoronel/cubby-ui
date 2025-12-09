import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterWithMinMax() {
  return (
    <div className="space-y-4">
      <MeterRoot value={25} min={0} max={50} className="w-[300px]">
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Response Time</MeterLabel>
          <MeterValue>{(formattedValue, value) => `${value}ms`}</MeterValue>
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      <MeterRoot value={4.2} min={0} max={5} className="w-[300px]">
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Rating</MeterLabel>
          <MeterValue>{(formattedValue, value) => `${value}/5`}</MeterValue>
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
