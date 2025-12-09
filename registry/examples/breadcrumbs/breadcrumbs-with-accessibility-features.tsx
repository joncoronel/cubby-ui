import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/registry/default/breadcrumbs/breadcrumbs";

export default function BreadcrumbsWithAccessibilityFeatures() {
  return (
    <Breadcrumb aria-label="Navigation breadcrumb" size="md">
      <BreadcrumbList>
        <BreadcrumbItem aria-label="Home page">
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis aria-label="More navigation pages" />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem aria-label="Current section">
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
