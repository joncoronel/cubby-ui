import { Slider, SliderLabel } from "@/registry/default/slider/slider";

export default function SliderWithSteps() {
  return (
    <Slider className="max-w-sm" defaultValue={50} step={25} showSteps>
      <SliderLabel>Step: 25</SliderLabel>
    </Slider>
  );
}
