import ToastBasic from "@/registry/examples/toast/toast-basic";
import ToastPromise from "@/registry/examples/toast/toast-promise";
import ToastGrouped from "@/registry/examples/toast/toast-grouped";
import ToastVaryingHeights from "@/registry/examples/toast/toast-varying-heights";

export default function TestPage() {
  return (
    <div>
      <ToastBasic />
      <ToastPromise />

      <ToastVaryingHeights />
      <ToastGrouped />
    </div>
  );
}
