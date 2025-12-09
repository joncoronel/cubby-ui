import { Slider, SliderValue } from "@/registry/default/slider/slider";

export default function SliderWithValue() {
  return (
    <Slider className="max-w-sm" defaultValue={75}>
      <SliderValue />
    </Slider>
  );
}
