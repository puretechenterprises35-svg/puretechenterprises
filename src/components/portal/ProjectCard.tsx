import { Link } from "@tanstack/react-router";
import type { Project } from "@/lib/portal/projects";
import { ProjectStatusBadge, PriorityBadge } from "./ProjectStatusBadge";
import { ProgressBar } from "./ProgressBar";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/portal/projects/$projectId"
      params={{ projectId: project.id }}
      className="block rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {project.project_name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {project.service_category ?? "—"}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="mt-4">
        <ProgressBar value={project.progress_percentage} size="sm" />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <PriorityBadge priority={project.priority} />
        <span>
          Due:{" "}
          {project.due_date
            ? new Date(project.due_date).toLocaleDateString()
            : "—"}
        </span>
      </div>
    </Link>
  );
}
