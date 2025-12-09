import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionChevronIndicator() {
  return (
    <Accordion className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger indicatorType="chevron">
          What payment methods do you accept?
        </AccordionTrigger>
        <AccordionContent>
          We accept all major credit cards (Visa, Mastercard, American Express),
          PayPal, and bank transfers. For enterprise customers, we also offer
          invoice-based billing with NET-30 payment terms.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger indicatorType="chevron">
          How does the free trial work?
        </AccordionTrigger>
        <AccordionContent>
          Your 14-day free trial includes full access to all features. No credit
          card is required to start. You can cancel anytime during the trial
          period without being charged.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger indicatorType="chevron">
          Can I change my plan later?
        </AccordionTrigger>
        <AccordionContent>
          Yes, you can upgrade or downgrade your plan at any time. Changes take
          effect immediately, and billing is prorated based on your usage.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
