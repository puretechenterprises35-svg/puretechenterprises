import { Clock } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <EmptyState
      icon={Clock}
      title={`${feature} — Coming Soon`}
      description="This section is being prepared. You'll be able to access it here shortly."
    />
  );
}
