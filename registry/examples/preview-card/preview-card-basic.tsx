import { PreviewCard, PreviewCardTrigger, PreviewCardContent } from "@/registry/default/preview-card/preview-card";
import { Calendar, MapPin } from "lucide-react";

export default function PreviewCardBasic() {
  return (
    <PreviewCard>
      <PreviewCardTrigger>
        <span className="font-medium text-blue-600 hover:underline cursor-pointer">
          @nextjs
        </span>
      </PreviewCardTrigger>
      <PreviewCardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              N
            </div>
            <div>
              <h3 className="font-semibold">Next.js</h3>
              <p className="text-sm text-muted-foreground">@nextjs</p>
            </div>
          </div>
          <p className="text-sm">
            The React Framework for the Web. Used by some of the world's
            largest companies.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined March 2020</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </PreviewCardContent>
    </PreviewCard>
  );
}