import { Link } from "@tanstack/react-router";
import type { Project } from "@/lib/portal/projects";
import { ProjectStatusBadge, PriorityBadge } from "./ProjectStatusBadge";
import { ProgressBar } from "./ProgressBar";

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ProjectTable({ projects }: { projects: Project[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    to="/portal/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {p.project_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.service_category ?? "—"}</td>
                <td className="px-4 py-3"><ProjectStatusBadge status={p.status} /></td>
                <td className="px-4 py-3 w-40">
                  <ProgressBar value={p.progress_percentage} size="sm" showLabel={false} />
                  <span className="mt-1 block text-xs text-muted-foreground">{p.progress_percentage}%</span>
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(p.start_date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(p.due_date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(p.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <ul className="divide-y divide-border md:hidden">
        {projects.map((p) => (
          <li key={p.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to="/portal/projects/$projectId"
                params={{ projectId: p.id }}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-medium text-foreground">{p.project_name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {p.service_category ?? "—"}
                </p>
              </Link>
              <ProjectStatusBadge status={p.status} />
            </div>
            <div className="mt-3">
              <ProgressBar value={p.progress_percentage} size="sm" showLabel={false} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <PriorityBadge priority={p.priority} />
              <span>Due: {fmt(p.due_date)}</span>
              <span>Updated: {fmt(p.updated_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
