import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/default/carousel/carousel";
import { Card, CardContent } from "@/registry/default/card/card";

export default function CarouselImage() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {[
          { color: "bg-red-200", text: "Image 1" },
          { color: "bg-blue-200", text: "Image 2" },
          { color: "bg-green-200", text: "Image 3" },
          { color: "bg-purple-200", text: "Image 4" },
        ].map((item, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent
                  className={`flex aspect-square items-center justify-center p-6 ${item.color}`}
                >
                  <span className="text-xl font-semibold">{item.text}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}