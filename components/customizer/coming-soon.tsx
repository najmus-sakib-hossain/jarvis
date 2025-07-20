import { Clock } from "lucide-react";

export function ComingSoon() {
  return (
    <span className="text-muted-foreground flex items-center gap-2 text-sm">
      <Clock className="size-4" />
      Coming soon...
    </span>
  );
}
