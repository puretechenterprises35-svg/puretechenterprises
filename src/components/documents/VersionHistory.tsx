import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/documents/constants";
import { downloadDocument, type DocumentRow } from "@/lib/documents/queries";

export function VersionHistory({ versions }: { versions: DocumentRow[] }) {
  if (!versions.length) {
    return <p className="text-sm text-muted-foreground">No version history.</p>;
  }
  return (
    <ol className="space-y-2">
      {versions.map((v, i) => (
        <li
          key={v.id}
          className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
        >
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            v{v.version}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{v.file_name}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(v.uploaded_at), "d MMM yyyy, HH:mm")} · {formatBytes(v.file_size)}
              {i === 0 && " · current"}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => downloadDocument(v)}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </li>
      ))}
    </ol>
  );
}
