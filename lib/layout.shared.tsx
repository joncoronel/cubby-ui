import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { CubbyUILogo } from "@/components/cubbyui-logo";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex items-center gap-2">
        <CubbyUILogo className="h-6" />
        <span className="font-rubik text-lg font-semibold tracking-tight">
          Cubby UI
        </span>
      </div>
    ),
  },
  links: [],
};
