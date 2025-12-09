import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";

export default function AccordionSplitVariant() {
  return (
    <Accordion variant="split" className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>Performance Settings</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Rendering quality</span>
              <span className="text-muted-foreground text-sm">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-save interval</span>
              <span className="text-muted-foreground text-sm">30s</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Workspace Layout</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sidebar position</span>
              <span className="text-muted-foreground text-sm">Left</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Panel transparency</span>
              <span className="text-muted-foreground text-sm">Opaque</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Export Options</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Default format</span>
              <span className="text-muted-foreground text-sm">PNG</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Compression level</span>
              <span className="text-muted-foreground text-sm">Medium</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
