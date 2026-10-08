import {
  type MeterStatus,
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterTargetRange,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

const READINGS = [
  { id: "breakfast", label: "Before breakfast", value: 5.6 },
  { id: "lunch", label: "Before lunch", value: 8.9 },
];

function describe(formatted: string, _: number, status?: MeterStatus): string {
  const inRange = status === "optimum" ? "in range" : "out of range";
  return `${formatted} mmol/L, ${inRange}`;
}

export default function MeterTargetRangeExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {READINGS.map((reading) => (
        <MeterRoot
          key={reading.id}
          value={reading.value}
          min={2}
          max={14}
          low={4}
          high={7}
          optimum={5.5}
          format={{ maximumFractionDigits: 1 }}
          getAriaValueText={describe}
        >
          <MeterLabel>{reading.label}</MeterLabel>
          <MeterValue>{(formatted) => `${formatted} mmol/L`}</MeterValue>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
          <MeterTargetRange />
          <p className="text-muted-foreground text-xs">
            Target 4.0 to 7.0 mmol/L
          </p>
        </MeterRoot>
      ))}
    </div>
  );
}
