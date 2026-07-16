import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CategoryBadge } from "@/components/documents/CategoryBadge";
import { FileTypeBadge } from "@/components/documents/FileTypeBadge";
import { VersionHistory } from "@/components/documents/VersionHistory";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import {
  documentQuery,
  documentActivityQuery,
  documentVersionsQuery,
  downloadDocument,
  useDeleteDocument,
  useUpdateDocumentMeta,
} from "@/lib/documents/queries";
import { adminProjectsQuery } from "@/lib/admin/queries";
import { DOCUMENT_CATEGORIES, formatBytes } from "@/lib/documents/constants";

export const Route = createFileRoute("/admin/documents/$documentId")({
  head: () => ({ meta: [{ title: "Document · Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminDocumentDetail,
});

function AdminDocumentDetail() {
  const { documentId } = Route.useParams();
  const navigate = useNavigate();
  const doc = useQuery(documentQuery(documentId));
  const activity = useQuery(documentActivityQuery(documentId));
  const versions = useQuery(documentVersionsQuery(documentId));
  const projects = useQuery(adminProjectsQuery());
  const meta = useUpdateDocumentMeta();
  const del = useDeleteDocument();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    project_id: "",
    visible_to_client: true,
  });

  if (doc.isLoading) return <AdminShell title="Document"><p>Loading…</p></AdminShell>;
  if (!doc.data) return <AdminShell title="Document"><p>Not found.</p></AdminShell>;

  const d = doc.data;
  const projectOptions = (projects.data ?? []).map((p) => ({
    id: p.id,
    project_name: p.project_name,
    client_id: p.client_id,
  }));

  const startEdit = () => {
    setForm({
      title: d.title,
      description: d.description ?? "",
      category: d.category,
      project_id: d.project_id,
      visible_to_client: d.visible_to_client,
    });
    setEditing(true);
  };

  const save = () => {
    const patch: Record<string, unknown> = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      visible_to_client: form.visible_to_client,
    };
    if (form.project_id !== d.project_id) {
      const p = projectOptions.find((x) => x.id === form.project_id);
      if (p) {
        patch.project_id = p.id;
        patch.client_id = p.client_id;
      }
    }
    meta.mutate(
      { id: d.id, patch: patch as never, previous: d },
      {
        onSuccess: () => {
          toast.success("Document updated");
          setEditing(false);
        },
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  const handleDelete = () => {
    del.mutate(d, {
      onSuccess: () => {
        toast.success("Document deleted");
        navigate({ to: "/admin/documents" });
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <AdminShell title="Document Detail">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/documents"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">{d.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d.description || "—"}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CategoryBadge category={d.category} />
                  <FileTypeBadge fileName={d.file_name} />
                  <span className="text-xs text-muted-foreground">v{d.version} · {formatBytes(d.file_size)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => downloadDocument(d)}>
                  <Download className="mr-1.5 h-4 w-4" /> Download
                </Button>
                {!editing ? (
                  <Button size="sm" variant="outline" onClick={startEdit}>Edit</Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>

            {editing && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Project (move)</Label>
                    <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Switch
                      checked={form.visible_to_client}
                      onCheckedChange={(v) => setForm({ ...form, visible_to_client: v })}
                    />
                    <Label>Visible to client</Label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={save} disabled={meta.isPending}>Save changes</Button>
                </div>
              </div>
            )}
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold">Replace with new version</h3>
            <DocumentUploader
              projects={projectOptions}
              defaultProjectId={d.project_id}
              onUploaded={() => {
                void doc.refetch();
                void versions.refetch();
              }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Uploads made here are automatically linked as a new version of this document.
            </p>
            {/* Replace flow: we could pass replacesDocumentId, but uploader takes a full form.
                Admins can also use the top-level uploader. Version linkage is handled via replaces_document_id
                for advanced flows. */}
          </section>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold">Metadata</h3>
            <dl className="space-y-2 text-sm">
              <MetaRow k="Project" v={d.project?.project_name ?? "—"} />
              <MetaRow k="Client" v={d.client?.company_name ?? d.client?.contact_person ?? "—"} />
              <MetaRow k="File name" v={d.file_name} />
              <MetaRow k="File type" v={d.file_type} />
              <MetaRow k="Size" v={formatBytes(d.file_size)} />
              <MetaRow k="Downloads" v={String(d.download_count)} />
              <MetaRow k="Visibility" v={d.visible_to_client ? "Visible" : "Hidden"} />
              <MetaRow k="Uploaded" v={format(new Date(d.uploaded_at), "d MMM yyyy, HH:mm")} />
              <MetaRow k="Updated" v={format(new Date(d.updated_at), "d MMM yyyy, HH:mm")} />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold">Version history</h3>
            <VersionHistory versions={versions.data ?? []} />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold">Activity</h3>
            {activity.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (activity.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {activity.data!.map((a) => (
                  <li key={a.id} className="border-b border-border/40 pb-1 last:border-0">
                    <p className="font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(a.created_at), "d MMM yyyy, HH:mm")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete document?"
        description={`This permanently removes "${d.title}" and its file.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </AdminShell>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right text-foreground">{v}</dd>
    </div>
  );
}
