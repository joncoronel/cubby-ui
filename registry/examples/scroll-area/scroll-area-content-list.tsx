import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

export default function ScrollAreaContentList() {
  return (
    <ScrollArea className="h-[300px] w-[350px] rounded-md border p-4">
      <h4 className="mb-4 text-sm font-medium">Notifications</h4>
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-accent" />
            <div className="space-y-1">
              <p className="text-sm font-medium">New message from User {i + 1}</p>
              <p className="text-sm text-muted-foreground">
                Hey, how are you doing? I wanted to check in...
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}