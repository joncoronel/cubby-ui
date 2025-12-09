import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionDefaultExpanded() {
  return (
    <Accordion
      multiple={false}
      defaultValue={["item-2"]}
      className="w-full max-w-lg"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent>
          Learn the basics of our platform with our comprehensive onboarding
          guide. We'll walk you through setting up your account and creating
          your first project.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Installation Guide</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <p>Follow these steps to install and configure our software:</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Download the latest version from our website</li>
              <li>Run the installer with administrator privileges</li>
              <li>Configure your initial settings</li>
              <li>Verify the installation was successful</li>
            </ol>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Troubleshooting</AccordionTrigger>
        <AccordionContent>
          If you encounter any issues, check our troubleshooting guide first.
          Most common problems can be resolved by restarting the application or
          clearing your browser cache.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
