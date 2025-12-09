import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionNested() {
  return (
    <Accordion variant="nested" className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>Project Overview</AccordionTrigger>
        <AccordionContent>
          This project aims to modernize our customer service platform with
          improved response times and better user experience. The nested design
          helps organize different project phases clearly.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Team Members</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Sarah Chen</span>
              <span className="text-muted-foreground text-sm">
                Project Manager
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Michael Rodriguez</span>
              <span className="text-muted-foreground text-sm">
                Lead Developer
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Emily Johnson</span>
              <span className="text-muted-foreground text-sm">UI Designer</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Timeline & Milestones</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="border-primary border-l-2 pl-3">
              <p className="text-sm font-medium">
                Phase 1: Research & Planning
              </p>
              <p className="text-muted-foreground text-xs">Jan 15 - Feb 28</p>
            </div>
            <div className="border-muted border-l-2 pl-3">
              <p className="text-sm font-medium">Phase 2: Development</p>
              <p className="text-muted-foreground text-xs">Mar 1 - May 15</p>
            </div>
            <div className="border-muted border-l-2 pl-3">
              <p className="text-sm font-medium">Phase 3: Testing & Launch</p>
              <p className="text-muted-foreground text-xs">May 16 - Jun 30</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Budget & Resources</AccordionTrigger>
        <AccordionContent>
          Total project budget: $150,000. Resources include cloud
          infrastructure, third-party integrations, and additional contractor
          support for peak development periods.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
