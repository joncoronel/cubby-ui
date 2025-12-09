import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionIsolatedFilledVariant() {
  return (
    <Accordion variant="isolated-filled" className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>Account Settings</AccordionTrigger>
        <AccordionContent>
          Manage your account preferences and personal information. Update your
          profile details, change your password, and configure your account
          settings here.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionContent>
          Configure how and when you receive notifications. Customize email
          alerts, push notifications, and other communication preferences.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Privacy & Security</AccordionTrigger>
        <AccordionContent>
          Control your privacy settings and security options. Adjust data
          sharing preferences, manage activity tracking, and review your
          security settings.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Billing & Payments</AccordionTrigger>
        <AccordionContent>
          View and manage your billing information, payment methods, and
          subscription details. Update your payment preferences and review your
          billing history.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
