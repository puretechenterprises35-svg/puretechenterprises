import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminProjectsQuery, adminClientsQuery,
  useArchiveProject, useDeleteProject, useUpdateProject,
  type AdminProject,
} from "@/lib/admin/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2, Plus } from "lucide-react";
import { ProjectStatusBadge } from "@/components/portal/ProjectStatusBadge";
import { ProgressBar } from "@/components/portal/ProgressBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjectsPage,
});

type Sort = "updated" | "due" | "progress";

function AdminProjectsPage() {
  const projects = useQuery(adminProjectsQuery());
  const clients = useQuery(adminClientsQuery());
  const archive = useArchiveProject();
  const del = useDeleteProject();
  const update = useUpdateProject();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [clientId, setClientId] = useState("all");
  const [service, setService] = useState("all");
  const [sort, setSort] = useState<Sort>("updated");
  const [showArchived, setShowArchived] = useState(false);
  const [confirm, setConfirm] = useState<null | { title: string; description: string; action: () => Promise<void>; destructive?: boolean }>(null);

  const services = useMemo(() => Array.from(new Set((projects.data ?? []).map((p) => p.service_category).filter(Boolean) as string[])), [projects.data]);

  const rows = useMemo(() => {
    const items = projects.data ?? [];
    const term = search.toLowerCase().trim();
    const filtered = items.filter((p) => {
      if (!showArchived && p.archived_at) return false;
      if (showArchived && !p.archived_at) return false;
      if (status !== "all" && p.status !== status) return false;
      if (priority !== "all" && p.priority !== priority) return false;
      if (clientId !== "all" && p.client_id !== clientId) return false;
      if (service !== "all" && p.service_category !== service) return false;
      if (term && !p.project_name.toLowerCase().includes(term)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "due") return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
      if (sort === "progress") return b.progress_percentage - a.progress_percentage;
      return b.updated_at.localeCompare(a.updated_at);
    });
  }, [projects.data, search, status, priority, clientId, service, sort, showArchived]);

  const askDelete = (p: AdminProject) => setConfirm({
    title: "Delete project?",
    description: `Permanently delete "${p.project_name}" and its updates. This cannot be undone.`,
    destructive: true,
    action: async () => {
      try { await del.mutateAsync(p.id); toast.success("Project deleted"); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    },
  });

  const askArchive = (p: AdminProject) => setConfirm({
    title: p.archived_at ? "Restore project?" : "Archive project?",
    description: p.archived_at ? "The project will become visible to the client again." : "The project will be hidden from the client but kept in admin view.",
    action: async () => {
      try {
        await archive.mutateAsync({ id: p.id, archive: !p.archived_at });
        toast.success(p.archived_at ? "Restored" : "Archived");
      } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    },
  });

  return (
    <AdminShell title="Projects">
      <div className="flex flex-wrap items-end gap-3">
        <Input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Pending", "In Progress", "Waiting for Client", "Completed", "Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {["Low", "Medium", "High", "Urgent"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Client" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {(clients.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name || c.email}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Service" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="due">Due date</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={showArchived ? "default" : "outline"} onClick={() => setShowArchived((s) => !s)}>
          {showArchived ? "Viewing archived" : "Show archived"}
        </Button>
        <div className="ml-auto">
          <Button asChild><Link to="/admin/projects/new"><Plus className="mr-1 h-4 w-4" /> New project</Link></Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-soft">
        {projects.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground">No projects.</TableCell></TableRow>
                ) : rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link to="/admin/projects/$projectId" params={{ projectId: p.id }} className="font-medium hover:underline">
                        {p.project_name}
                      </Link>
                      {p.service_category && <p className="text-xs text-muted-foreground">{p.service_category}</p>}
                    </TableCell>
                    <TableCell className="text-sm">{p.client?.company_name || p.client?.contact_person || "—"}</TableCell>
                    <TableCell><ProjectStatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-sm">{p.priority}</TableCell>
                    <TableCell className="min-w-[120px]"><ProgressBar value={p.progress_percentage} /></TableCell>
                    <TableCell className="text-xs">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/projects/$projectId" params={{ projectId: p.id }}>Open</Link>
                          </DropdownMenuItem>
                          {p.status !== "Completed" && (
                            <DropdownMenuItem onClick={async () => {
                              try {
                                await update.mutateAsync({ id: p.id, patch: { status: "Completed", progress_percentage: 100, completion_date: new Date().toISOString() } });
                                toast.success("Marked completed");
                              } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                            }}>Mark completed</DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => askArchive(p)}>{p.archived_at ? "Restore" : "Archive"}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => askDelete(p)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        destructive={confirm?.destructive}
        onConfirm={() => { const c = confirm; setConfirm(null); void c?.action(); }}
      />
    </AdminShell>
  );
}
