import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentFilters, type DocFilterState } from "@/components/documents/DocumentFilters";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { StorageIndicator } from "@/components/documents/StorageIndicator";
import { CategoryBadge } from "@/components/documents/CategoryBadge";
import { FileTypeBadge } from "@/components/documents/FileTypeBadge";
import {
  documentsQuery,
  storageStatsQuery,
  downloadDocument,
  useDeleteDocument,
  useUpdateDocumentMeta,
  type DocumentRow,
} from "@/lib/documents/queries";
import { adminProjectsQuery } from "@/lib/admin/queries";
import { extFromName, formatBytes } from "@/lib/documents/constants";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/documents")({
  head: () => ({ meta: [{ title: "Documents · Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminDocuments,
});

function AdminDocuments() {
  const docs = useQuery(documentsQuery());
  const stats = useQuery(storageStatsQuery());
  const projects = useQuery(adminProjectsQuery());
  const del = useDeleteDocument();
  const meta = useUpdateDocumentMeta();

  const [preview, setPreview] = useState<DocumentRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DocumentRow | null>(null);
  const [filters, setFilters] = useState<DocFilterState>({
    search: "",
    category: "all",
    project: "all",
    fileType: "all",
    sort: "newest",
  });

  const projectOptions = useMemo(
    () =>
      (projects.data ?? [])
        .filter((p) => !p.archived_at)
        .map((p) => ({ id: p.id, project_name: p.project_name, client_id: p.client_id })),
    [projects.data]
  );

  const projectFilterOptions = useMemo(
    () => projectOptions.map((p) => ({ id: p.id, name: p.project_name })),
    [projectOptions]
  );

  const fileTypes = useMemo(() => {
    const set = new Set<string>();
    (docs.data ?? []).forEach((d) => set.add(extFromName(d.file_name)));
    return Array.from(set).filter(Boolean).sort();
  }, [docs.data]);

  const filtered = useMemo(() => {
    const list = (docs.data ?? []).filter((d) => {
      if (filters.category !== "all" && d.category !== filters.category) return false;
      if (filters.project !== "all" && d.project_id !== filters.project) return false;
      if (filters.fileType !== "all" && extFromName(d.file_name) !== filters.fileType) return false;
      if (filters.search && !d.title.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (filters.sort === "name") return a.title.localeCompare(b.title);
      if (filters.sort === "category") return a.category.localeCompare(b.category);
      const at = new Date(a.uploaded_at).getTime();
      const bt = new Date(b.uploaded_at).getTime();
      return filters.sort === "oldest" ? at - bt : bt - at;
    });
  }, [docs.data, filters]);

  const toggleVisibility = (d: DocumentRow) => {
    meta.mutate(
      {
        id: d.id,
        patch: { visible_to_client: !d.visible_to_client },
        previous: d,
      },
      {
        onSuccess: () => toast.success("Visibility updated"),
        onError: (e) => toast.error((e as Error).message),
      }
    );
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    del.mutate(confirmDelete, {
      onSuccess: () => {
        toast.success("Document deleted");
        setConfirmDelete(null);
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <AdminShell title="Documents">
      <div className="grid gap-4 sm:grid-cols-3">
        <StorageIndicator
          totalBytes={stats.data?.totalBytes ?? 0}
          totalDocs={stats.data?.totalDocs ?? 0}
        />
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded today</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {stats.data?.uploadedToday ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            Most downloaded
          </p>
          {stats.data?.mostDownloaded.length ? (
            <ul className="space-y-1 text-xs">
              {stats.data.mostDownloaded.slice(0, 3).map((m, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="truncate">{m.title}</span>
                  <span className="text-muted-foreground">{m.download_count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No downloads yet.</p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Upload documents</h2>
        <DocumentUploader projects={projectOptions} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">All documents</h2>
        <DocumentFilters
          value={filters}
          onChange={setFilters}
          projects={projectFilterOptions}
          fileTypes={fileTypes}
        />

        {docs.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (docs.data?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
            No documents uploaded yet.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No documents match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2">v</th>
                  <th className="px-3 py-2">Uploaded</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 font-medium">
                      <Link
                        to="/admin/documents/$documentId"
                        params={{ documentId: d.id }}
                        className="hover:text-primary"
                      >
                        {d.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {d.project?.project_name ?? "—"}
                    </td>
                    <td className="px-3 py-2"><CategoryBadge category={d.category} /></td>
                    <td className="px-3 py-2"><FileTypeBadge fileName={d.file_name} /></td>
                    <td className="px-3 py-2 text-muted-foreground">{formatBytes(d.file_size)}</td>
                    <td className="px-3 py-2">v{d.version}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {format(new Date(d.uploaded_at), "d MMM yyyy")}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title={d.visible_to_client ? "Hide from client" : "Show to client"}
                          onClick={() => toggleVisibility(d)}
                        >
                          {d.visible_to_client ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadDocument(d)}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => setConfirmDelete(d)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <DocumentPreview doc={preview} onClose={() => setPreview(null)} />
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete document?"
        description={`This will permanently remove "${confirmDelete?.title}" and its file. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </AdminShell>
  );
}
