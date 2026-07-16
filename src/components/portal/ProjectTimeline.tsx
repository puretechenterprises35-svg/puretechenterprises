import { CircleDot } from "lucide-react";
import type { ProjectUpdate } from "@/lib/portal/projects";
import { EmptyState } from "./EmptyState";

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectTimeline({ updates }: { updates: ProjectUpdate[] }) {
  if (updates.length === 0) {
    return (
      <EmptyState
        icon={CircleDot}
        title="No updates yet"
        description="Project updates from our team will appear here."
      />
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {updates.map((u) => (
        <li key={u.id} className="relative">
          <span className="absolute -left-[29px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary" />
          <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">{u.update_title}</h4>
              <time className="text-xs text-muted-foreground">{fmt(u.created_at)}</time>
            </div>
            {u.update_message && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {u.update_message}
              </p>
            )}
            {typeof u.progress_percentage === "number" && (
              <p className="mt-2 text-xs font-medium text-primary">
                Progress: {u.progress_percentage}%
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
