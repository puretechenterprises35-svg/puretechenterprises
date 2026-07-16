import { HardDrive } from "lucide-react";
import { formatBytes } from "@/lib/documents/constants";

export function StorageIndicator({
  totalBytes,
  totalDocs,
}: {
  totalBytes: number;
  totalDocs: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HardDrive className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Storage used</p>
        <p className="text-lg font-semibold text-foreground">{formatBytes(totalBytes)}</p>
        <p className="text-xs text-muted-foreground">{totalDocs} documents</p>
      </div>
    </div>
  );
}
