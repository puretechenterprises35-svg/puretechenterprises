import { Download, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";
import { FileTypeBadge } from "./FileTypeBadge";
import { formatBytes, isPreviewable } from "@/lib/documents/constants";
import type { DocumentRow } from "@/lib/documents/queries";

export function DocumentCard({
  doc,
  onDownload,
  onPreview,
  onOpen,
  showVisibility,
}: {
  doc: DocumentRow;
  onDownload: (d: DocumentRow) => void;
  onPreview: (d: DocumentRow) => void;
  onOpen?: (d: DocumentRow) => void;
  showVisibility?: boolean;
}) {
  const canPreview = isPreviewable(doc.file_type);
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpen?.(doc)}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
            {doc.title}
          </h3>
          {doc.project?.project_name && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {doc.project.project_name}
            </p>
          )}
        </button>
        {showVisibility ? (
          doc.visible_to_client ? (
            <Eye className="h-4 w-4 text-emerald-600" aria-label="Visible to client" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" aria-label="Hidden from client" />
          )
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={doc.category} />
        <FileTypeBadge fileName={doc.file_name} />
        <span className="text-xs text-muted-foreground">v{doc.version}</span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <div>
          <dt className="text-[10px] uppercase tracking-wide">Size</dt>
          <dd className="text-foreground/80">{formatBytes(doc.file_size)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide">Uploaded</dt>
          <dd className="text-foreground/80">
            {format(new Date(doc.uploaded_at), "d MMM yyyy")}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide">Updated</dt>
          <dd className="text-foreground/80">
            {format(new Date(doc.updated_at), "d MMM yyyy")}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide">Downloads</dt>
          <dd className="text-foreground/80">{doc.download_count}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        <Button
          size="sm"
          variant="default"
          className="flex-1"
          onClick={() => onDownload(doc)}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Download
        </Button>
        {canPreview && (
          <Button size="sm" variant="outline" onClick={() => onPreview(doc)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
          </Button>
        )}
      </div>
    </div>
  );
}
