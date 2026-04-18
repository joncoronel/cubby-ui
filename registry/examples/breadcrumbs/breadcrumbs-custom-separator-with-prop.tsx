import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/default/breadcrumbs/breadcrumbs";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
export default function BreadcrumbsCustomSeparatorWithProp() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator separator={<HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4"  strokeWidth={2} />} />
        <BreadcrumbItem>
          <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator separator={<HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4"  strokeWidth={2} />} />
        <BreadcrumbItem>
          <BreadcrumbPage>Article Title</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
