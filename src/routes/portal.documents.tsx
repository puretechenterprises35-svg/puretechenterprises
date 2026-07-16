import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { EmptyState } from "@/components/portal/EmptyState";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentFilters, type DocFilterState } from "@/components/documents/DocumentFilters";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import {
  documentsQuery,
  downloadDocument,
  type DocumentRow,
} from "@/lib/documents/queries";
import { extFromName } from "@/lib/documents/constants";
import { usePortalRealtime } from "@/hooks/use-portal-realtime";

export const Route = createFileRoute("/portal/documents")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Documents | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalDocuments,
});

function PortalDocuments() {
  usePortalRealtime();
  const { data: docs, isLoading, error } = useQuery(documentsQuery());
  const [preview, setPreview] = useState<DocumentRow | null>(null);
  const [filters, setFilters] = useState<DocFilterState>({
    search: "",
    category: "all",
    project: "all",
    fileType: "all",
    sort: "newest",
  });

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    (docs ?? []).forEach((d) => {
      if (d.project) map.set(d.project.id, d.project.project_name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [docs]);

  const fileTypes = useMemo(() => {
    const set = new Set<string>();
    (docs ?? []).forEach((d) => set.add(extFromName(d.file_name)));
    return Array.from(set).filter(Boolean).sort();
  }, [docs]);

  const filtered = useMemo(() => {
    const list = (docs ?? []).filter((d) => {
      if (filters.category !== "all" && d.category !== filters.category) return false;
      if (filters.project !== "all" && d.project_id !== filters.project) return false;
      if (filters.fileType !== "all" && extFromName(d.file_name) !== filters.fileType) return false;
      if (filters.search && !d.title.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      return true;
    });
    const sorted = [...list].sort((a, b) => {
      if (filters.sort === "name") return a.title.localeCompare(b.title);
      if (filters.sort === "category") return a.category.localeCompare(b.category);
      const at = new Date(a.uploaded_at).getTime();
      const bt = new Date(b.uploaded_at).getTime();
      return filters.sort === "oldest" ? at - bt : bt - at;
    });
    return sorted;
  }, [docs, filters]);

  const grouped = useMemo(() => {
    const g = new Map<string, { name: string; docs: DocumentRow[] }>();
    filtered.forEach((d) => {
      const key = d.project_id;
      const name = d.project?.project_name ?? "Unassigned";
      if (!g.has(key)) g.set(key, { name, docs: [] });
      g.get(key)!.docs.push(d);
    });
    return Array.from(g.values());
  }, [filtered]);

  const handleDownload = async (d: DocumentRow) => {
    try {
      await downloadDocument(d);
      toast.success("Download started");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-sm text-muted-foreground">
          All contracts, invoices and files shared for your projects.
        </p>
      </div>

      <DocumentFilters
        value={filters}
        onChange={setFilters}
        projects={projects}
        fileTypes={fileTypes}
      />

      {isLoading ? (
        <LoadingScreen label="Loading your documents…" />
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load documents. Please refresh and try again.
        </div>
      ) : (docs?.length ?? 0) === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Puretech will upload contracts, invoices and reports here as your projects progress."
        />
      ) : grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          No documents match your filters.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.name}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {group.name}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  · {group.docs.length}
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.docs.map((d) => (
                  <DocumentCard
                    key={d.id}
                    doc={d}
                    onDownload={handleDownload}
                    onPreview={setPreview}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <DocumentPreview doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
