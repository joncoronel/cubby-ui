import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressFormat() {
  return (
    <ProgressRoot
      value={1.37}
      max={4.2}
      format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }}
      className="max-w-sm"
    >
      <ProgressLabel>Downloading macOS image</ProgressLabel>
      <ProgressValue>{(formatted) => `${formatted} of 4.2 GB`}</ProgressValue>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  );
}
