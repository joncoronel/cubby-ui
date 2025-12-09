import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";
import { CreditCardIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";

export default function AccordionWithIcon() {
  return (
    <Accordion multiple={false} className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger icon={<CreditCardIcon className="size-4" />}>
          Payment Methods
        </AccordionTrigger>
        <AccordionContent>
          We accept all major credit cards, PayPal, and bank transfers. Your
          payment information is encrypted and secure.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger icon={<TruckIcon className="size-4" />}>
          Shipping & Delivery
        </AccordionTrigger>
        <AccordionContent>
          Standard shipping typically takes 3-5 business days, while express
          shipping arrives within 1-2 business days. Free shipping is available
          on orders over $50.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger icon={<ShieldCheckIcon className="size-4" />}>
          Security & Privacy
        </AccordionTrigger>
        <AccordionContent>
          Your data is protected with industry-standard encryption. We never
          share your personal information with third parties without your
          explicit consent.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
