import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterWithThresholds() {
  return (
    <div className="w-full max-w-[300px] space-y-6">
      {/* Higher is better - three tiers (battery level) */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium">
          Battery Level (higher is better)
        </p>
        <MeterRoot value={10} low={15} optimumMin={75}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>Battery</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}%`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>

        <MeterRoot value={50} low={15} optimumMin={75}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>Battery</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}%`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>

        <MeterRoot value={85} low={15} optimumMin={75}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>Battery</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}%`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>
      </div>

      {/* Lower is better - three tiers (CPU temperature) */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium">
          CPU Temperature (lower is better)
        </p>
        <MeterRoot value={45} optimumMax={60} high={80} min={0} max={100}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>CPU Temp</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}°C`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>

        <MeterRoot value={70} optimumMax={60} high={80} min={0} max={100}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>CPU Temp</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}°C`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>

        <MeterRoot value={90} optimumMax={60} high={80} min={0} max={100}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>CPU Temp</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}°C`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>
      </div>

      {/* Middle is best - two tiers (body temperature) */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium">
          Body Temperature (middle range is safe)
        </p>
        <MeterRoot value={35} low={36} high={38} min={34} max={42}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>Body Temp</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}°C`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>

        <MeterRoot value={37} low={36} high={38} min={34} max={42}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>Body Temp</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}°C`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>

        <MeterRoot value={40} low={36} high={38} min={34} max={42}>
          <div className="flex items-center justify-between gap-2">
            <MeterLabel>Body Temp</MeterLabel>
            <MeterValue>{(_formattedValue, value) => `${value}°C`}</MeterValue>
          </div>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </MeterRoot>
      </div>
    </div>
  );
}
