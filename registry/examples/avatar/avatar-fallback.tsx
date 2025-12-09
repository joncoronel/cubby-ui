import { Avatar, AvatarImage, AvatarFallback } from "@/registry/default/avatar/avatar"

export default function AvatarFallbackDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/broken-image.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-sky-500 text-white">
          TK
        </AvatarFallback>
      </Avatar>
    </div>
  )
}