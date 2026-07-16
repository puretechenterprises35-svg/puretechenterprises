import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_EXTENSIONS,
  DOCUMENT_CATEGORIES,
  MAX_UPLOAD_BYTES,
  extFromName,
  formatBytes,
} from "@/lib/documents/constants";
import { useUploadDocument } from "@/lib/documents/queries";

interface FileEntry {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function DocumentUploader({
  projects,
  defaultProjectId,
  onUploaded,
}: {
  projects: { id: string; project_name: string; client_id: string }[];
  defaultProjectId?: string;
  onUploaded?: () => void;
}) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [category, setCategory] = useState<string>("Other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument();

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const accepted: FileEntry[] = [];
    for (const f of list) {
      const ext = "." + extFromName(f.name);
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        toast.error(`${f.name}: file type not allowed`);
        continue;
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        toast.error(`${f.name}: exceeds ${formatBytes(MAX_UPLOAD_BYTES)}`);
        continue;
      }
      accepted.push({ id: crypto.randomUUID(), file: f, status: "pending" });
    }
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const project = projects.find((p) => p.id === projectId);
  const canSubmit = !!project && files.some((f) => f.status === "pending") && !upload.isPending;

  const handleUpload = async () => {
    if (!project) return;
    for (const entry of files) {
      if (entry.status !== "pending") continue;
      setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading" } : f)));
      try {
        await upload.mutateAsync({
          file: entry.file,
          projectId: project.id,
          clientId: project.client_id,
          title: title || entry.file.name,
          description: description || undefined,
          category,
          visibleToClient: visible,
        });
        setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: "done" } : f)));
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: "error", error: (err as Error).message } : f
          )
        );
      }
    }
    toast.success("Upload finished");
    onUploaded?.();
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger><SelectValue placeholder="Choose project" /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Title (optional — defaults to filename)</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 Tax Clearance" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch checked={visible} onCheckedChange={setVisible} id="visible" />
          <Label htmlFor="visible">Visible to client immediately</Label>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        )}
      >
        <UploadCloud className="mb-2 h-8 w-8 text-primary" />
        <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepted: {ACCEPTED_EXTENSIONS.join(", ")} · Max {formatBytes(MAX_UPLOAD_BYTES)}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="flex-1 truncate">{f.file.name}</span>
              <span className="text-xs text-muted-foreground">{formatBytes(f.file.size)}</span>
              {f.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              {f.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {f.status === "error" && (
                <AlertCircle className="h-4 w-4 text-destructive" aria-label={f.error} />
              )}
              {f.status === "pending" && (
                <button onClick={() => removeFile(f.id)} aria-label="Remove">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <Button disabled={!canSubmit} onClick={handleUpload}>
          {upload.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
    </div>
  );
}
