import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { MousePointer, Timer, Info } from "lucide-react";

export default function PopoverHoverTrigger() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-medium mb-2">Hover Trigger Examples</h3>
        <p className="text-sm text-muted-foreground">
          Hover over the buttons to trigger popovers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic hover */}
        <div className="text-center space-y-4">
          <h4 className="font-medium">Basic Hover</h4>
          <Popover>
            <PopoverTrigger openOnHover render={<Button variant="outline" />}>
              <MousePointer className="mr-2 h-4 w-4" />
              Hover me
            </PopoverTrigger>
            <PopoverContent side="top" className="w-48">
              <div className="space-y-2">
                <h5 className="font-medium">Quick Info</h5>
                <p className="text-sm text-muted-foreground">
                  This popover appears instantly on hover.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Hover with delay */}
        <div className="text-center space-y-4">
          <h4 className="font-medium">Hover with Delay</h4>
          <Popover>
            <PopoverTrigger openOnHover delay={500} render={<Button variant="outline" />}>
              <Timer className="mr-2 h-4 w-4" />
              Hover (delayed)
            </PopoverTrigger>
            <PopoverContent side="top" className="w-52">
              <div className="space-y-2">
                <h5 className="font-medium">Delayed Popover</h5>
                <p className="text-sm text-muted-foreground">
                  This popover has a 500ms delay before appearing.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Hover with close delay */}
        <div className="text-center space-y-4">
          <h4 className="font-medium">Hover with Close Delay</h4>
          <Popover>
            <PopoverTrigger openOnHover closeDelay={500} render={<Button variant="outline" />}>
              <Info className="mr-2 h-4 w-4" />
              Hover (close delay)
            </PopoverTrigger>
            <PopoverContent side="top" className="w-56">
              <div className="space-y-2">
                <h5 className="font-medium">Sticky Hover</h5>
                <p className="text-sm text-muted-foreground">
                  This popover waits 500ms before closing when you stop
                  hovering.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

    </div>
  );
}
