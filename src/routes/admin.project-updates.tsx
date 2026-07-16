import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { UpdateEditor } from "@/components/admin/UpdateEditor";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  adminAllUpdatesQuery, adminProjectsQuery,
  useCreateProjectUpdate, useDeleteProjectUpdate,
} from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export const Route = createFileRoute("/admin/project-updates")({
  component: AdminUpdatesPage,
});

function AdminUpdatesPage() {
  const projects = useQuery(adminProjectsQuery());
  const updates = useQuery(adminAllUpdatesQuery());
  const publish = useCreateProjectUpdate();
  const remove = useDeleteProjectUpdate();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <AdminShell title="Project updates">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold">Publish a new update</h2>
          <UpdateEditor
            projects={(projects.data ?? []).filter((p) => !p.archived_at).map((p) => ({ id: p.id, project_name: p.project_name }))}
            submitting={publish.isPending}
            onSubmit={async (v) => {
              try { await publish.mutateAsync(v); toast.success("Update published"); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-sm font-semibold">Recent updates</h2>
          {updates.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : updates.data && updates.data.length > 0 ? (
            <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {updates.data.map((u) => (
                <li key={u.id} className="border-b border-border/50 pb-2 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.update_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.project?.project_name ?? "Project"} · {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </p>
                      <div className="mt-1 flex gap-1">
                        {u.progress_percentage != null && <Badge variant="outline">{u.progress_percentage}%</Badge>}
                        {u.visible_to_client ? <Badge variant="secondary">Client</Badge> : <Badge variant="outline">Internal</Badge>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConfirmId(u.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No updates yet.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Delete update?"
        description="This will remove the update from the timeline."
        destructive
        onConfirm={async () => {
          const id = confirmId; setConfirmId(null);
          if (!id) return;
          try { await remove.mutateAsync(id); toast.success("Deleted"); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
        }}
      />
    </AdminShell>
  );
}
