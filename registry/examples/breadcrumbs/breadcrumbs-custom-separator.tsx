import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/default/breadcrumbs/breadcrumbs";
import { HugeiconsIcon } from "@hugeicons/react";
import { DivideSignIcon } from "@hugeicons/core-free-icons";
export default function BreadcrumbsCustomSeparator() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <HugeiconsIcon icon={DivideSignIcon} className="h-4 w-4"  strokeWidth={2} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <HugeiconsIcon icon={DivideSignIcon} className="h-4 w-4"  strokeWidth={2} />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Article Title</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
