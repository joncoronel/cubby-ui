import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionHiddenUntilFound() {
  return (
    <Accordion hiddenUntilFound className="w-full max-w-lg">
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>
          Orders ship within two business days. Tracking details arrive by email
          once the parcel leaves the warehouse.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>
          Return unused items within 30 days for a full refund. Opened
          electronics carry a 15% restocking fee.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionContent>
          Every product includes a one-year warranty covering manufacturing
          defects. Contact support with your order number to start a claim.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
