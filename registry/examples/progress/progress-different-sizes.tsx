import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressDifferentSizes() {
  return (
    <div className="space-y-4">
      <ProgressRoot value={60} size="sm" className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Small</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>

      <ProgressRoot value={60} size="md" className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Medium</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>

      <ProgressRoot value={60} size="lg" className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Large</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>
    </div>
  );
}
