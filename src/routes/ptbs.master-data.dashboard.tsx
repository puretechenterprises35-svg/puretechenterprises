import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Layers,
  FolderTree,
  Boxes,
  Package,
  FileText,
  BookOpen,
  Plus,
  FileBarChart,
  Activity,
  ArrowRight,
} from "lucide-react";
import { PageContainer } from "@/components/ptbs/PageContainer";
import { WorkspaceHeader } from "@/components/ptbs/WorkspaceHeader";
import { KPIWidget } from "@/components/ptbs/KPIWidget";
import { DashboardCard } from "@/components/ptbs/DashboardCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ptbs/master-data/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Master Data Dashboard | PTBS" },
      { name: "description", content: "Manage all business master records used across PTBS." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MasterDataDashboard,
});

const QUICK_ACTIONS = [
  { label: "Add Division", icon: Layers, to: "/ptbs/master-data/divisions" },
  { label: "Add Category", icon: FolderTree, to: "/ptbs/master-data/categories" },
  { label: "Add Service", icon: Boxes, to: "/ptbs/master-data/services" },
  { label: "Add Package", icon: Package, to: "/ptbs/master-data/packages" },
  { label: "Generate Report", icon: FileBarChart, to: "/ptbs/master-data/reports" },
] as const;

const KPIS = [
  { label: "Divisions", value: 0, icon: Layers },
  { label: "Categories", value: 0, icon: FolderTree },
  { label: "Services", value: 0, icon: Boxes },
  { label: "Packages", value: 0, icon: Package },
  { label: "Templates", value: 0, icon: FileText },
  { label: "Knowledge Base", value: 0, icon: BookOpen },
] as const;

const QUICK_LINKS = [
  { label: "Services", to: "/ptbs/master-data/services", icon: Boxes },
  { label: "Packages", to: "/ptbs/master-data/packages", icon: Package },
  { label: "Categories", to: "/ptbs/master-data/categories", icon: FolderTree },
  { label: "Divisions", to: "/ptbs/master-data/divisions", icon: Layers },
  { label: "Reports", to: "/ptbs/master-data/reports", icon: FileBarChart },
] as const;

function MasterDataDashboard() {
  return (
    <PageContainer>
      <WorkspaceHeader
        title="Master Data Workspace"
        description="Manage all business master records used across PTBS."
      />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Button key={a.label} asChild variant="default" size="sm" className="gap-2">
              <Link to={a.to}>
                <Plus className="h-4 w-4" />
                <Icon className="h-4 w-4" />
                {a.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {KPIS.map((k) => (
          <KPIWidget key={k.label} label={k.label} value={k.value} icon={k.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard title="Recent Activity" className="lg:col-span-2">
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-foreground">No recent activity.</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Activities will appear here after users begin working.
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Links">
          <div className="space-y-2">
            {QUICK_LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="group flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {l.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
