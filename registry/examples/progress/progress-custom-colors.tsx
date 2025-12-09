import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressCustomColors() {
  return (
    <div className="space-y-4">
      <ProgressRoot value={75} className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Primary (Default)</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressRoot>

      <ProgressRoot value={75} className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Success</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator className="bg-green-500" />
        </ProgressTrack>
      </ProgressRoot>

      <ProgressRoot value={75} className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Warning</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator className="bg-amber-500" />
        </ProgressTrack>
      </ProgressRoot>

      <ProgressRoot value={75} className="w-[400px]">
        <div className="flex items-center justify-between">
          <ProgressLabel>Danger</ProgressLabel>
          <ProgressValue />
        </div>
        <ProgressTrack>
          <ProgressIndicator className="bg-red-500" />
        </ProgressTrack>
      </ProgressRoot>
    </div>
  );
}
