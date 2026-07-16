import { cn } from "@/lib/utils";
import type { ProjectStatus, ProjectPriority } from "@/lib/portal/projects";

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  Pending: "bg-muted text-muted-foreground",
  "In Progress": "bg-primary/10 text-primary",
  "Waiting for Client": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cancelled: "bg-destructive/10 text-destructive",
};

const PRIORITY_CLASSES: Record<ProjectPriority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  High: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Urgent: "bg-destructive/10 text-destructive",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
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

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
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
