import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/invoices/queries";

const MAP: Record<InvoiceStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Issued: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Partially Paid": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Overdue: "bg-destructive/10 text-destructive",
  Cancelled: "bg-muted text-muted-foreground line-through",
};

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", MAP[status], className)}>
      {status}
    </span>
  );
}
