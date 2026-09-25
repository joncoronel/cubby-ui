import { Avatar, AvatarImage, AvatarFallback } from "@/registry/default/avatar/avatar"

const people = [
  { name: "shadcn", initials: "CN", src: "https://github.com/shadcn.png" },
  { name: "Vercel", initials: "VC", src: "https://github.com/vercel.png" },
  { name: "Linear", initials: "LN", src: "https://github.com/linear.png" },
  { name: "Missing", initials: "MS", src: "https://github.com/404-not-a-user-xyz.png" },
]

export default function AvatarLazy() {
  return (
    <div className="flex items-center gap-4">
      {people.map((person) => (
        <Avatar key={person.name}>
          <AvatarImage
            keepMounted
            loading="lazy"
            src={person.src}
            alt={person.name}
          />
          <AvatarFallback>{person.initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}
