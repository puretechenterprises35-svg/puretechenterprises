import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, FileText, Receipt } from "lucide-react";
import {
  projectQueryOptions,
  projectUpdatesQueryOptions,
} from "@/lib/portal/projects";
import { ProgressBar } from "@/components/portal/ProgressBar";
import {
  ProjectStatusBadge,
  PriorityBadge,
} from "@/components/portal/ProjectStatusBadge";
import { ProjectTimeline } from "@/components/portal/ProjectTimeline";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { EmptyState } from "@/components/portal/EmptyState";
import { usePortalRealtime } from "@/hooks/use-portal-realtime";

export const Route = createFileRoute("/portal/projects/$projectId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Project | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProjectDetailsPage,
});

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProjectDetailsPage() {
  usePortalRealtime();
  const { projectId } = useParams({ from: "/portal/projects/$projectId" });
  const {
    data: project,
    isLoading,
    error,
  } = useQuery(projectQueryOptions(projectId));
  const { data: updates = [], isLoading: loadingUpdates } = useQuery(
    projectUpdatesQueryOptions(projectId)
  );

  if (isLoading) return <LoadingScreen label="Loading project…" />;
  if (error || !project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been removed or you no longer have access."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/portal/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{project.project_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.service_category ?? "General"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {project.description || "No description provided."}
            </p>
            <div className="mt-6">
              <ProgressBar value={project.progress_percentage} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Project timeline</h2>
            {loadingUpdates ? (
              <LoadingScreen label="Loading updates…" />
            ) : (
              <ProjectTimeline updates={updates} />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="h-4 w-4 text-primary" /> Key dates
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Start</dt>
                <dd className="font-medium">{fmt(project.start_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Due</dt>
                <dd className="font-medium">{fmt(project.due_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated completion</dt>
                <dd className="font-medium">{fmt(project.due_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Completed</dt>
                <dd className="font-medium">{fmt(project.completion_date)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" /> Documents
            </h2>
            <p className="text-sm text-muted-foreground">
              Documents attached to this project will appear here.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Receipt className="h-4 w-4 text-primary" /> Invoices
            </h2>
            <p className="text-sm text-muted-foreground">
              Invoices related to this project will appear here.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
