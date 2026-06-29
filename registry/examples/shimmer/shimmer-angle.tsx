export default function ShimmerAngle() {
  return (
    <div className="text-muted-foreground flex h-32 w-full flex-col items-center justify-center gap-3 text-sm">
      <p className="shimmer">Default &middot; 20&deg;</p>
      <p className="shimmer shimmer-angle-0">Flat &middot; 0&deg;</p>
      <p className="shimmer shimmer-angle-45">Steeper &middot; 45&deg;</p>
    </div>
  );
}
