import { Badge } from "@/registry/default/badge/badge";

export default function BadgeCustomColors() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Blue
      </Badge>
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Green
      </Badge>
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
        Amber
      </Badge>
      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        Purple
      </Badge>
    </div>
  );
}