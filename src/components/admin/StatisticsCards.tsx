import { StatCard } from "@/components/portal/StatCard";
import { Users, UserCheck, UserPlus, FolderKanban, CheckCircle2, Clock, DollarSign, AlertCircle } from "lucide-react";

export function StatisticsCards({ stats }: { stats: {
  totalClients: number;
  activeClients: number;
  pendingApprovals: number;
  activeProjects: number;
  completedProjects: number;
  projectsDueSoon: number;
  monthlyRevenue: number;
  outstandingPayments: number;
} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Clients" value={stats.totalClients} icon={Users} />
      <StatCard label="Active Clients" value={stats.activeClients} icon={UserCheck} tone="success" />
      <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={UserPlus} tone="warning" />
      <StatCard label="Active Projects" value={stats.activeProjects} icon={FolderKanban} />
      <StatCard label="Completed" value={stats.completedProjects} icon={CheckCircle2} tone="success" />
      <StatCard label="Due Soon (7d)" value={stats.projectsDueSoon} icon={Clock} tone="warning" />
      <StatCard label="Monthly Revenue" value={`R ${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} hint="Placeholder" />
      <StatCard label="Outstanding" value={`R ${stats.outstandingPayments.toLocaleString()}`} icon={AlertCircle} tone="danger" hint="Placeholder" />
    </div>
  );
}
