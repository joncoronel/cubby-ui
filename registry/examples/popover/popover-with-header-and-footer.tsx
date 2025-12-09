import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverFooter,
  PopoverClose,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { Label } from "@/registry/default/label/label";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Settings } from "lucide-react";

export default function PopoverWithHeaderAndFooter() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>App Settings</PopoverTitle>
          <PopoverDescription>
            Manage your application preferences
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <Checkbox id="notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">Dark Mode</Label>
            <Checkbox id="darkMode" />
          </div>
        </div>
        <PopoverFooter>
          <PopoverClose render={<Button variant="outline" />}>
            Cancel
          </PopoverClose>
          <Button>Save changes</Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}