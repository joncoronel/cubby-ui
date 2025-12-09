import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionIndicatorStart() {
  return (
    <Accordion className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger indicatorPosition="start">
          Desktop Application
        </AccordionTrigger>
        <AccordionContent>
          Our desktop app is available for Windows, macOS, and Linux. It offers
          offline mode, native notifications, and seamless syncing with your
          cloud account.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger indicatorPosition="start">
          Mobile Application
        </AccordionTrigger>
        <AccordionContent>
          Download our mobile app for iOS and Android. Features include
          biometric authentication, push notifications, and full functionality
          even when you're offline.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger indicatorPosition="start">
          Web Platform
        </AccordionTrigger>
        <AccordionContent>
          Access your account from any browser with our web platform. No
          installation required, automatic updates, and consistent experience
          across all devices.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
