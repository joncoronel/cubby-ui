import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionWithSubtitle() {
  return (
    <Accordion multiple={false} className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger subtitle="Learn about our hassle-free return process">
          What is your refund policy?
        </AccordionTrigger>
        <AccordionContent>
          We offer a 30-day money-back guarantee for all purchases. If you're
          not completely satisfied, contact our support team for a full refund.
          No questions asked.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger subtitle="Delivery times and shipping options">
          How long does shipping take?
        </AccordionTrigger>
        <AccordionContent>
          Standard shipping typically takes 3-5 business days, while express
          shipping arrives within 1-2 business days. Free shipping is available
          on orders over $50.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger subtitle="Get help from our expert team">
          Do you offer technical support?
        </AccordionTrigger>
        <AccordionContent>
          Yes! Our technical support team is available 24/7 via email and live
          chat. We also have comprehensive documentation and video tutorials.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
