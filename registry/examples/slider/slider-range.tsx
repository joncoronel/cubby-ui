import { Slider } from "@/registry/default/slider/slider";

export default function SliderRange() {
  return (
    <Slider
      className="max-w-sm"
      defaultValue={[25, 75]}
      label="Price range"
      getAriaLabel={(index) =>
        index === 0 ? "Minimum price" : "Maximum price"
      }
    />
  );
}
