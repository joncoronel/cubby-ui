import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionDisabled() {
  return (
    <Accordion multiple={true} className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>Account Information</AccordionTrigger>
        <AccordionContent>
          Update your personal details, contact information, and profile
          preferences. Changes are saved automatically.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Subscription Settings</AccordionTrigger>
        <AccordionContent>
          Manage your subscription plan, billing details, and payment methods.
          This section is temporarily unavailable for maintenance.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Privacy & Security</AccordionTrigger>
        <AccordionContent>
          Configure your privacy settings, manage connected accounts, and enable
          two-factor authentication to keep your account secure.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
