import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

export default function ProgressSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ProgressRoot key={size} value={64} size={size}>
          <ProgressLabel className="capitalize">{size}</ProgressLabel>
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </ProgressRoot>
      ))}
    </div>
  );
}
