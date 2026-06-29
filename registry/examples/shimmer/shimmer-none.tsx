export default function ShimmerNone() {
  return (
    <div className="text-muted-foreground flex h-32 w-full flex-col items-center justify-center gap-3 text-sm">
      <p className="shimmer">Shimmer on</p>
      <p className="shimmer shimmer-none">Shimmer off</p>
    </div>
  );
}
