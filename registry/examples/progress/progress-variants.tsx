import {
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/registry/default/progress/progress";

const VARIANTS = [
  { variant: "default", label: "Syncing library", value: 48 },
  { variant: "info", label: "Indexing documents", value: 62 },
  { variant: "success", label: "Backup verified", value: 100 },
  { variant: "warning", label: "Retrying chunk 4 of 9", value: 41 },
  { variant: "danger", label: "Upload stalled", value: 27 },
] as const;

export default function ProgressVariants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {VARIANTS.map(({ variant, label, value }) => (
        <ProgressRoot key={variant} value={value} variant={variant}>
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
