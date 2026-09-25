import {
  BaseDrawer,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerPanel,
  BaseDrawerPopup,
  BaseDrawerTitle,
  BaseDrawerTrigger,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";

const comments = [
  { id: 1, author: "Maya", text: "Can we push the launch to Thursday?" },
  { id: 2, author: "Theo", text: "Thursday works. QA needs one more pass." },
  { id: 3, author: "Maya", text: "I'll update the release notes tonight." },
  { id: 4, author: "Ines", text: "Screenshots for the changelog are ready." },
  { id: 5, author: "Theo", text: "Nice. Dropping them in the shared folder?" },
  { id: 6, author: "Ines", text: "Already there, under /launch/assets." },
];

export default function BaseDrawerKeyboardAware() {
  return (
    <BaseDrawer>
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Open Comments
      </BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Comments</BaseDrawerTitle>
          <BaseDrawerDescription>
            The reply field stays above the on-screen keyboard.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerPanel>
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li key={comment.id} className="bg-muted/50 rounded-lg border p-3">
                <p className="text-sm font-medium">{comment.author}</p>
                <p className="text-muted-foreground text-sm">{comment.text}</p>
              </li>
            ))}
          </ul>
        </BaseDrawerPanel>
        <BaseDrawerFooter variant="inset" className="flex-row items-center">
          <Input
            aria-label="Reply"
            placeholder="Write a reply…"
            variant="elevated"
            className="flex-1"
          />
          <Button size="icon" aria-label="Send reply">
            <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
          </Button>
        </BaseDrawerFooter>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
