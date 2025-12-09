import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionMultiple() {
  return (
    <Accordion multiple={true} className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>Features Overview</AccordionTrigger>
        <AccordionContent>
          Our platform includes real-time collaboration, advanced analytics,
          automated workflows, and enterprise-grade security. All features work
          seamlessly together to boost your team's productivity.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Pricing Plans</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Starter</span>
              <span className="text-muted-foreground text-sm">$9/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Professional</span>
              <span className="text-muted-foreground text-sm">$29/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Enterprise</span>
              <span className="text-muted-foreground text-sm">Contact us</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>System Requirements</AccordionTrigger>
        <AccordionContent>
          Compatible with Windows 10+, macOS 10.15+, and modern Linux
          distributions. Requires 4GB RAM minimum, 8GB recommended. Internet
          connection required for cloud features.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
