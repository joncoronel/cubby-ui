import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionWithoutIndicator() {
  return (
    <Accordion multiple={true} className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger showIndicator={false}>
          Company Mission
        </AccordionTrigger>
        <AccordionContent>
          We believe in creating technology that empowers people to achieve
          their goals while maintaining the highest standards of privacy and
          security. Our mission drives every decision we make.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Our Values</AccordionTrigger>
        <AccordionContent>
          Innovation, integrity, and customer success are at the core of
          everything we do. We strive to build lasting relationships through
          exceptional products and transparent communication.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger showIndicator={false}>Global Impact</AccordionTrigger>
        <AccordionContent>
          Through our platform, we've helped over 10,000 businesses streamline
          their operations and reduce their environmental footprint by 40% on
          average.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
