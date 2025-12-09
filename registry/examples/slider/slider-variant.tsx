import { Slider } from "@/registry/default/slider/slider";

export default function SliderVariant() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <Slider variant="contained" defaultValue={50} />

      <Slider variant="squareThumb" defaultValue={50} />
    </div>
  );
}
