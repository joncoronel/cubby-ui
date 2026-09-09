import { HugeiconsIcon } from "@hugeicons/react";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import FolderCodeIcon from "@hugeicons/core-free-icons/FolderCodeIcon";

import { Button } from "@/registry/default/button/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/default/empty/empty";

export default function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={FolderCodeIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button>Create Project</Button>
        <Button variant="outline">Import Project</Button>
      </EmptyContent>
      <Button
        variant="link"
        size="sm"
        className="text-muted-foreground"
        render={<a href="#" />}
        nativeButton={false}
        trailingIcon={
          <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
        }
      >
        Learn More
      </Button>
    </Empty>
  );
}
