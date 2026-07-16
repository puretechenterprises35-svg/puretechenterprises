import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createSignedUrl,
  downloadDocument,
  type DocumentRow,
} from "@/lib/documents/queries";
import { isPreviewable } from "@/lib/documents/constants";

export function DocumentPreview({
  doc,
  onClose,
}: {
  doc: DocumentRow | null;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setUrl(null);
    setTextContent(null);
    createSignedUrl(doc.file_path, 300)
      .then(async (signed) => {
        if (cancelled) return;
        setUrl(signed);
        if (doc.file_type === "text/plain") {
          const res = await fetch(signed);
          const txt = await res.text();
          if (!cancelled) setTextContent(txt.slice(0, 100_000));
        }
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [doc]);

  const previewable = doc ? isPreviewable(doc.file_type) : false;

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate">{doc?.title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-[60vh]">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading preview…
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Unable to load preview: {error}
            </div>
          ) : !previewable || !doc ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Preview is not available for this file type.
              </p>
              {doc && (
                <Button onClick={() => downloadDocument(doc)}>
                  <Download className="mr-1.5 h-4 w-4" /> Download instead
                </Button>
              )}
            </div>
          ) : doc.file_type === "application/pdf" && url ? (
            <iframe src={url} title={doc.title} className="h-[70vh] w-full rounded-md border border-border" />
          ) : doc.file_type.startsWith("image/") && url ? (
            <div className="flex justify-center">
              <img src={url} alt={doc.title} className="max-h-[70vh] rounded-md" />
            </div>
          ) : doc.file_type === "text/plain" && textContent !== null ? (
            <pre className="max-h-[70vh] overflow-auto rounded-md border border-border bg-muted/40 p-4 text-xs">
              {textContent}
            </pre>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
