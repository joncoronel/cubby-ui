import { Slider, SliderLabel } from "@/registry/default/slider/slider";

export default function SliderRange() {
  return (
    <Slider
      className="max-w-sm"
      defaultValue={[25, 75]}
      getAriaLabel={(index) =>
        index === 0 ? "Minimum price" : "Maximum price"
      }
    >
      <SliderLabel>Price range</SliderLabel>
    </Slider>
  );
}
