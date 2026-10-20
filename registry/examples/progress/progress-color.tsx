import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

const COLORS = [
  { color: "neutral", label: "Generating thumbnails", value: 73 },
  { color: "primary", label: "Syncing library", value: 48 },
  { color: "info", label: "Indexing documents", value: 62 },
  { color: "success", label: "Backup verified", value: 100 },
  { color: "warning", label: "Retrying chunk 4 of 9", value: 41 },
  { color: "danger", label: "Upload stalled", value: 27 },
] as const;

export default function ProgressColor() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {COLORS.map(({ color, label, value }) => (
        <ProgressRoot key={color} value={value} color={color}>
          <ProgressLabel>{label}</ProgressLabel>
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </ProgressRoot>
      ))}
    </div>
  );
}
