export default function ShimmerDuration() {
  return (
    <div className="text-muted-foreground flex h-32 w-full flex-col items-center justify-center gap-3 text-sm">
      <p className="shimmer">Default &middot; 2s</p>
      <p className="shimmer shimmer-duration-1000">Faster &middot; 1s</p>
      <p className="shimmer shimmer-duration-3500">Slower &middot; 3.5s</p>
    </div>
  );
}
