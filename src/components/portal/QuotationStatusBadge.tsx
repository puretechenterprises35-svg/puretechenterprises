import type { QuotationStatus } from "@/lib/portal/quotations";
import { cn } from "@/lib/utils";

const MAP: Record<QuotationStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Sent: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Accepted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Rejected: "bg-destructive/15 text-destructive",
  Expired: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Revised: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        MAP[status]
      )}
    >
      {status}
    </span>
  );
}
