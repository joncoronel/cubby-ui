import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

export default function PopoverAdvancedPositioning() {
  return (
    <div className="grid grid-cols-3 gap-8 place-items-center min-h-[400px]">
      {/* Top row */}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowUp className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent side="top" align="start" sideOffset={12}>
          <p className="text-sm">Top-start aligned</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowUp className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent side="top" align="center" sideOffset={12}>
          <p className="text-sm">Top-center aligned</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowUp className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent side="top" align="end" sideOffset={12}>
          <p className="text-sm">Top-end aligned</p>
        </PopoverContent>
      </Popover>

      {/* Middle row */}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowLeft className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent side="left" align="center" sideOffset={12}>
          <p className="text-sm">Left side</p>
        </PopoverContent>
      </Popover>

      <div className="text-center">
        <h3 className="font-medium">Advanced Positioning</h3>
        <p className="text-sm text-muted-foreground">
          Click buttons to see different sides and alignments
        </p>
      </div>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowRight className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent side="right" align="center" sideOffset={12}>
          <p className="text-sm">Right side</p>
        </PopoverContent>
      </Popover>

      {/* Bottom row */}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowDown className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" sideOffset={12}>
          <p className="text-sm">Bottom-start aligned</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowDown className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="center"
          sideOffset={12}
          alignOffset={20}
        >
          <p className="text-sm">Bottom with align offset</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowDown className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" sideOffset={12}>
          <p className="text-sm">Bottom-end aligned</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
