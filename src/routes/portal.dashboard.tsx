import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  FileText,
  Activity,
} from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";
import {
  projectsQueryOptions,
  recentUpdatesQueryOptions,
} from "@/lib/portal/projects";
import { clientInvoiceSummaryQuery, formatCurrency, myInvoicesQuery } from "@/lib/invoices/queries";
import { EmptyProjects } from "@/components/portal/EmptyProjects";
import { ProjectCard } from "@/components/portal/ProjectCard";
import { usePortalRealtime } from "@/hooks/use-portal-realtime";

export const Route = createFileRoute("/portal/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalDashboard,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function StatSkeleton() {
  return (
    <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
  );
}

function PortalDashboard() {
  usePortalRealtime();

  const { data: projects, isLoading: loadingProjects } = useQuery(
    projectsQueryOptions()
  );
  const { data: updates, isLoading: loadingUpdates } = useQuery(
    recentUpdatesQueryOptions(5)
  );
  const invSummary = useQuery(clientInvoiceSummaryQuery());
  const recentInv = useQuery(myInvoicesQuery());

  const stats = useMemo(() => {
    const list = projects ?? [];
    const active = list.filter(
      (p) => p.status === "In Progress" || p.status === "Waiting for Client" || p.status === "Pending"
    ).length;
    const completed = list.filter((p) => p.status === "Completed").length;
    return { active, completed };
  }, [projects]);

  const recentProjects = useMemo(
    () => (projects ?? []).slice(0, 3),
    [projects]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your account activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingProjects ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Active Projects" value={stats.active} icon={FolderKanban} tone="default" />
            <StatCard label="Completed Projects" value={stats.completed} icon={CheckCircle2} tone="success" />
            <StatCard label="Outstanding Payments" value="ZMW 0" icon={CreditCard} tone="warning" hint="Payments module coming soon" />
            <StatCard label="Unread Messages" value={0} icon={MessageSquare} tone="danger" hint="Messaging coming soon" />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <header className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Recent Activity</h2>
            </div>
            <Link to="/portal/projects" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </header>
          {loadingUpdates ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (updates?.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {updates!.map((u) => (
                <li key={u.id} className="py-3">
                  <Link
                    to="/portal/projects/$projectId"
                    params={{ projectId: u.project_id }}
                    className="flex items-start justify-between gap-3 text-sm hover:text-primary"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{u.update_title}</p>
                      {u.update_message && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {u.update_message}
                        </p>
                      )}
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {timeAgo(u.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <header className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Your Projects</h2>
            </div>
            <Link to="/portal/projects" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </header>
          {loadingProjects ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <EmptyProjects />
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
