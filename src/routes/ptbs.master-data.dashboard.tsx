import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Layers,
  FolderTree,
  Boxes,
  Package,
  Plus,
  Activity,
  ArrowRight,
  Eye,
} from "lucide-react";
import { PageContainer } from "@/components/ptbs/PageContainer";
import { WorkspaceHeader } from "@/components/ptbs/WorkspaceHeader";
import { KPIWidget } from "@/components/ptbs/KPIWidget";
import { DashboardCard } from "@/components/ptbs/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDivisions, type Division } from "@/lib/ptbs/divisions";

export const Route = createFileRoute("/ptbs/master-data/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Master Data Dashboard | PTBS" },
      { name: "description", content: "Central repository for reference data used across PTBS." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MasterDataDashboard,
});

function MasterDataDashboard() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDivisions()
      .then(setDivisions)
      .catch(() => setDivisions([]))
      .finally(() => setLoading(false));
  }, []);

  const recent = [...divisions]
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 6);

  const kpis = [
    { label: "Total Divisions", value: loading ? "—" : divisions.length, icon: Layers },
    { label: "Total Categories", value: 0, icon: FolderTree },
    { label: "Total Services", value: 0, icon: Boxes },
    { label: "Total Packages", value: 0, icon: Package },
  ];

  return (
    <PageContainer>
      <WorkspaceHeader
        title="Master Data Workspace"
        description="Central repository for reference data used across PTBS."
      />

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" className="gap-2">
          <Link to="/ptbs/master-data/divisions">
            <Plus className="h-4 w-4" /> Add Division
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-2">
          <Link to="/ptbs/master-data/divisions">
            <Eye className="h-4 w-4" /> View Divisions
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KPIWidget key={k.label} label={k.label} value={k.value} icon={k.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard title="Recent Activity" className="lg:col-span-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Activity className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-foreground">No recent activity.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="font-mono text-xs text-muted-foreground">{d.division_code}</span>
                      <span className="truncate">{d.division_name}</span>
                      <Badge variant={d.status === "Active" ? "default" : "secondary"} className="text-[10px]">{d.status}</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(d.updated_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Quick Links">
          <div className="space-y-2">
            <Link
              to="/ptbs/master-data/divisions"
              className="group flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Divisions
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
            {[
              { label: "Categories", icon: FolderTree },
              { label: "Services", icon: Boxes },
              { label: "Packages", icon: Package },
            ].map((l) => {
              const Icon = l.icon;
              return (
                <div
                  key={l.label}
                  className="flex cursor-not-allowed items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {l.label}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">Soon</span>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
