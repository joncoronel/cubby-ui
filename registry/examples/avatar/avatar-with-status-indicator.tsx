import { Avatar, AvatarImage, AvatarFallback } from "@/registry/default/avatar/avatar"

export default function AvatarWithStatusIndicator() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://github.com/vercel.png" />
          <AvatarFallback>VC</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-background" />
      </div>
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://github.com/linear.png" />
          <AvatarFallback>LN</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
      </div>
    </div>
  )
}