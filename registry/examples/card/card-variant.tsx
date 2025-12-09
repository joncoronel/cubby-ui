import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";

export default function CardVariant() {
  return (
    <div className="flex gap-4">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>Clean and simple design.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            This is the default card variant with minimal styling.
          </p>
        </CardContent>
      </Card>

      <Card variant="inset" className="w-[350px]">
        <CardHeader>
          <CardTitle>Inset Card</CardTitle>
          <CardDescription>Nested border effect.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            This is the inset variant with an outer and inner border design.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
