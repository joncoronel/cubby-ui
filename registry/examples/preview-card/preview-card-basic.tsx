import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
} from "@/registry/default/preview-card/preview-card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, MapPinIcon } from "@hugeicons/core-free-icons";
export default function PreviewCardBasic() {
  return (
    <PreviewCard>
      <PreviewCardTrigger>
        <span className="cursor-pointer font-medium text-blue-600 hover:underline">
          @nextjs
        </span>
      </PreviewCardTrigger>
      <PreviewCardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
              N
            </div>
            <div>
              <h3 className="font-semibold">Next.js</h3>
              <p className="text-muted-foreground text-sm">@nextjs</p>
            </div>
          </div>
          <p className="text-sm">
            The React Framework for the Web. Used by some of the world&apos;s
            largest companies.
          </p>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4"  strokeWidth={2} />
              <span>Joined March 2020</span>
            </div>
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={MapPinIcon} className="h-4 w-4"  strokeWidth={2} />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  );
}
