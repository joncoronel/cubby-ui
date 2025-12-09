import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressWithLabel() {
  return (
    <div className="space-y-4">
      <ProgressRoot value={65} animated className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>File Upload</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>

      <ProgressRoot value={100} animated>
        <div className="flex items-center justify-between">
          <ProgressLabel>Installation</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>
    </div>
  );
}
