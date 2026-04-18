import { Slider, SliderLabel } from "@/registry/default/slider/slider";

export default function SliderBasic() {
  return (
    <Slider className="max-w-sm" defaultValue={50}>
      <SliderLabel>Volume</SliderLabel>
    </Slider>
  );
}
