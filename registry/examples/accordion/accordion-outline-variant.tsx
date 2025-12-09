import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";
import { Badge } from "@/registry/default/badge/badge";

export default function AccordionOutlineVariant() {
  return (
    <Accordion variant="outline" className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>Dashboard Settings</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Theme preference</span>
              <span className="text-muted-foreground text-sm">Light</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Email notifications</span>
              <Badge variant="success">Enabled</Badge>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Language & Region</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Display language</span>
              <span className="text-muted-foreground text-sm">English</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Time zone</span>
              <span className="text-muted-foreground text-sm">UTC</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Data & Privacy</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Data retention</span>
              <span className="text-muted-foreground text-sm">1 year</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Analytics sharing</span>
              <Badge variant="outline">Disabled</Badge>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
