export default function ShimmerSpread() {
  return (
    <div className="text-muted-foreground flex h-32 w-full flex-col items-center justify-center gap-3 text-sm">
      <p className="shimmer">Default band</p>
      <p className="shimmer shimmer-spread-24">Wider band</p>
      <p className="shimmer shimmer-spread-[3rem]">Narrow band</p>
    </div>
  );
}
