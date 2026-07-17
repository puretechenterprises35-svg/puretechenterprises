import { cn } from "@/lib/utils";
import type { EnquiryStatus, EnquiryPriority } from "@/lib/portal/enquiries";

const STATUS_CLASSES: Record<EnquiryStatus, string> = {
  "Pending Review": "bg-muted text-muted-foreground",
  "Needs More Information": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Rejected: "bg-destructive/10 text-destructive",
  "Converted to Project": "bg-primary/10 text-primary",
};

const PRIORITY_CLASSES: Record<EnquiryPriority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  High: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status]
      )}
    >
      {status}
    </span>
  );
}

export function EnquiryPriorityBadge({ priority }: { priority: EnquiryPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PRIORITY_CLASSES[priority]
      )}
    >
      {priority}
    </span>
  );
}
