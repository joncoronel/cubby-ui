import { Skeleton } from "@/registry/default/skeleton/skeleton";

export default function SkeletonMultiline() {
  return (
    <p className="max-w-[400px] text-sm leading-relaxed">
      <Skeleton multiline>
        This is a paragraph with a skeleton loading effect that spans multiple
        lines. The shimmer flows across every line fragment as one continuous
        wave, not a separate animation per line.
      </Skeleton>
    </p>
  );
}
