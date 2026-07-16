import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatisticsCards } from "@/components/admin/StatisticsCards";
import { adminStatsQuery, adminAllUpdatesQuery } from "@/lib/admin/queries";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery(adminStatsQuery());
  const updates = useQuery(adminAllUpdatesQuery());

  return (
    <AdminShell title="Admin Dashboard">
      {stats.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading statistics…
        </div>
      ) : stats.data ? (
        <StatisticsCards stats={stats.data} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-sm font-semibold">Recent updates</h2>
          {updates.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : updates.data && updates.data.length > 0 ? (
            <ul className="space-y-3">
              {updates.data.slice(0, 6).map((u) => (
                <li key={u.id} className="border-b border-border/50 pb-2 last:border-0">
                  <p className="text-sm font-medium">{u.update_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.project?.project_name ?? "Project"} ·{" "}
                    {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No updates yet.</p>
          )}
          <Button asChild variant="link" className="mt-2 px-0">
            <Link to="/admin/project-updates">View all →</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-sm font-semibold">Reporting</h2>
          <p className="text-sm text-muted-foreground">
            Revenue and payment charts will appear here once payments are wired in.
          </p>
          <div className="mt-4 h-32 rounded-md bg-gradient-to-br from-primary/10 to-primary/5" />
        </div>
      </div>
    </AdminShell>
  );
}
