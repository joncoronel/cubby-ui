export default function ShimmerColor() {
  return (
    <div className="text-muted-foreground flex h-32 w-full flex-col items-center justify-center gap-3 text-sm">
      <p className="shimmer">Generating response&hellip;</p>
      <p className="shimmer shimmer-color-primary">Generating response&hellip;</p>
      <p className="shimmer shimmer-color-[#22c55e]">Generating response&hellip;</p>
    </div>
  );
}
