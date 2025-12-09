import { Avatar, AvatarImage, AvatarFallback } from "@/registry/default/avatar/avatar"

export default function AvatarBasic() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}