import {
  PullDownMenu,
  PullDownMenuContent,
  PullDownMenuItem,
  PullDownMenuSeparator,
} from "@/registry/default/pull-down-menu/pull-down-menu";
import { ChevronDownIcon } from "lucide-react";

export default function PullDownMenuBasic() {
  return (
    <PullDownMenu>
      <PullDownMenuContent
        trigger={
          <>
            Options
            <ChevronDownIcon className="ml-1 size-4" />
          </>
        }
      >
        <PullDownMenuItem>Profile</PullDownMenuItem>
        <PullDownMenuItem>Settings</PullDownMenuItem>
        <PullDownMenuItem>Notifications</PullDownMenuItem>
        <PullDownMenuSeparator />
        <PullDownMenuItem variant="destructive">Log out</PullDownMenuItem>
      </PullDownMenuContent>
    </PullDownMenu>
  );
}
