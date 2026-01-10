import ToastBasic from "@/registry/examples/toast/toast-basic";
import ToastPromise from "@/registry/examples/toast/toast-promise";

import ToastVaryingHeights from "@/registry/examples/toast/toast-varying-heights";

export default function TestPage() {
  return (
    <div>
      <ToastBasic />
      <ToastPromise />

      <ToastVaryingHeights />
    </div>
  );
}
