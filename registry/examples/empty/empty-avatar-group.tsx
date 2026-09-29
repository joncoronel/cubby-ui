import { HugeiconsIcon } from "@hugeicons/react";
import PlusSignIcon from "@hugeicons/core-free-icons/PlusSignIcon";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/default/avatar/avatar";
import { Button } from "@/registry/default/button/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/default/empty/empty";

export default function EmptyAvatarGroup() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/maxleiter.png"
                alt="@maxleiter"
              />
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/evilrabbit.png"
                alt="@evilrabbit"
              />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>
        </EmptyMedia>
        <EmptyTitle>No Team Members</EmptyTitle>
        <EmptyDescription>
          Invite your team to collaborate on this project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          size="sm"
          leadingIcon={<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />}
        >
          Invite Members
        </Button>
      </EmptyContent>
    </Empty>
  );
}
