import { FileText, FileSpreadsheet, FileArchive, FileImage, File as FileIcon } from "lucide-react";
import { extFromName } from "@/lib/documents/constants";

function iconFor(ext: string) {
  if (["pdf"].includes(ext)) return { Icon: FileText, label: "PDF" };
  if (["doc", "docx", "txt"].includes(ext)) return { Icon: FileText, label: ext.toUpperCase() };
  if (["xls", "xlsx", "csv"].includes(ext)) return { Icon: FileSpreadsheet, label: ext.toUpperCase() };
  if (["zip", "rar"].includes(ext)) return { Icon: FileArchive, label: ext.toUpperCase() };
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return { Icon: FileImage, label: ext.toUpperCase() };
  return { Icon: FileIcon, label: ext ? ext.toUpperCase() : "FILE" };
}

export function FileTypeBadge({ fileName }: { fileName: string }) {
  const ext = extFromName(fileName);
  const { Icon, label } = iconFor(ext);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground/80">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
