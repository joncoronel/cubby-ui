import * as React from "react";
import FiltersBasic from "@/registry/examples/filters/filters-basic";

// The docs' basic example on its own, with nothing else on the page, to
// compare against the tune page.
export default function FiltersBasicStandalone(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <FiltersBasic />
    </div>
  );
}
