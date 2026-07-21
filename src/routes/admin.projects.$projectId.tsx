import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { UpdateEditor } from "@/components/admin/UpdateEditor";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  adminProjectQuery, adminClientsQuery,
  useUpdateProject, useDeleteProject, useArchiveProject,
  useCreateProjectUpdate, useDeleteProjectUpdate,
} from "@/lib/admin/queries";
import { projectUpdatesQueryOptions } from "@/lib/portal/projects";
import { formatCurrency } from "@/lib/currency";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/projects/$projectId")({
  component: AdminProjectDetail,
});

function AdminProjectDetail() {
  const { projectId } = Route.useParams();
  const project = useQuery(adminProjectQuery(projectId));
  const clients = useQuery(adminClientsQuery());
  const updates = useQuery(projectUpdatesQueryOptions(projectId));
  const update = useUpdateProject();
  const del = useDeleteProject();
  const archive = useArchiveProject();
  const publishUpdate = useCreateProjectUpdate();
  const deleteUpdate = useDeleteProjectUpdate();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<null | { title: string; description: string; action: () => Promise<void>; destructive?: boolean }>(null);

  if (project.isLoading) {
    return <AdminShell title="Project"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div></AdminShell>;
  }
  const p = project.data;
  if (!p) {
    return <AdminShell title="Not found"><p className="text-sm text-muted-foreground">Project not found.</p></AdminShell>;
  }

  return (
    <AdminShell title={p.project_name}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {p.project_number && <Badge variant="outline" className="font-mono">{p.project_number}</Badge>}
          <Badge variant="outline">{p.status}</Badge>
          <Badge variant="outline">Priority: {p.priority}</Badge>
          {p.archived_at && <Badge variant="destructive">Archived</Badge>}
          {p.client && <span className="text-muted-foreground">Client: {p.client.company_name || p.client.contact_person}</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConfirm({
            title: p.archived_at ? "Restore project?" : "Archive project?",
            description: p.archived_at ? "Client will see this project again." : "Client will no longer see this project.",
            action: async () => {
              await archive.mutateAsync({ id: p.id, archive: !p.archived_at });
              toast.success(p.archived_at ? "Restored" : "Archived");
            },
          })}>{p.archived_at ? "Restore" : "Archive"}</Button>
          <Button variant="destructive" onClick={() => setConfirm({
            title: "Delete project?", description: "Deletes the project and all its updates permanently.",
            destructive: true,
            action: async () => {
              await del.mutateAsync(p.id);
              toast.success("Project deleted");
              navigate({ to: "/admin/projects" });
            },
          })}>Delete</Button>
        </div>
      </div>

      {(p.quotation_id || p.enquiry_id || p.contract_value != null) && (
        <div className="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm shadow-soft sm:grid-cols-4">
          {p.quotation_id && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Quotation</p>
              <Button asChild variant="link" size="sm" className="px-0">
                <Link to="/admin/quotations/$quotationId" params={{ quotationId: p.quotation_id }}>View quotation</Link>
              </Button>
            </div>
          )}
          {p.enquiry_id && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Enquiry</p>
              <Button asChild variant="link" size="sm" className="px-0">
                <Link to="/admin/enquiries/$enquiryId" params={{ enquiryId: p.enquiry_id }}>View enquiry</Link>
              </Button>
            </div>
          )}
          {p.contract_value != null && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Contract value</p>
              <p className="font-medium">{formatCurrency(Number(p.contract_value), p.currency ?? undefined)}</p>
            </div>
          )}
          {p.grand_total != null && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Grand total (incl. VAT)</p>
              <p className="font-medium">{formatCurrency(Number(p.grand_total), p.currency ?? undefined)}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Project details</h2>
            <ProjectForm
              clients={clients.data ?? []}
              initial={{
                client_id: p.client_id,
                project_name: p.project_name,
                service_category: p.service_category,
                description: p.description,
                priority: p.priority,
                status: p.status,
                progress_percentage: p.progress_percentage,
                start_date: p.start_date,
                due_date: p.due_date,
              }}
              submitLabel="Save changes"
              submitting={update.isPending}
              onSubmit={async (values) => {
                try {
                  await update.mutateAsync({ id: p.id, patch: values });
                  toast.success("Saved");
                } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Publish an update</h2>
            <UpdateEditor
              projects={[{ id: p.id, project_name: p.project_name }]}
              defaultProjectId={p.id}
              submitting={publishUpdate.isPending}
              onSubmit={async (values) => {
                try {
                  await publishUpdate.mutateAsync(values);
                  toast.success("Update published");
                } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold">Timeline / Activity</h2>
            {updates.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : updates.data && updates.data.length > 0 ? (
              <ul className="space-y-3">
                {updates.data.map((u) => (
                  <li key={u.id} className="border-b border-border/50 pb-2 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{u.update_title}</p>
                        {u.update_message && <p className="text-xs text-muted-foreground">{u.update_message}</p>}
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                          {u.progress_percentage != null && ` · ${u.progress_percentage}%`}
                          {!u.visible_to_client && " · internal"}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={async () => {
                        try { await deleteUpdate.mutateAsync(u.id); toast.success("Removed"); }
                        catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                      }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No updates yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-2 text-sm font-semibold">Client view</h2>
            <p className="text-xs text-muted-foreground">
              Visible to client at:
            </p>
            <Button asChild variant="link" className="px-0">
              <Link to="/portal/projects/$projectId" params={{ projectId: p.id }}>Open client view</Link>
            </Button>
          </div>
        </div>
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
