import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
} from "@/registry/default/progress/progress";

export default function ProgressIndeterminate() {
  return (
    <ProgressRoot value={null} className="max-w-sm">
      <ProgressLabel>Preparing export</ProgressLabel>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  );
}
