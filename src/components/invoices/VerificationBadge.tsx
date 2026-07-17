import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/lib/invoices/queries";

const MAP: Record<VerificationStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Verified: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Rejected: "bg-destructive/10 text-destructive",
};

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", MAP[status], className)}>
      {status}
    </span>
  );
}
