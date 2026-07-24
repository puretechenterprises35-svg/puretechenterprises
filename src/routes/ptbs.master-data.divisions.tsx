import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Pencil, Archive, Eye, Loader2, ArrowUpDown } from "lucide-react";
import { PageContainer } from "@/components/ptbs/PageContainer";
import { WorkspaceHeader } from "@/components/ptbs/WorkspaceHeader";
import { DashboardCard } from "@/components/ptbs/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  archiveDivision, createDivision, listDivisions, updateDivision,
  type Division, type DivisionInput, type DivisionStatus,
} from "@/lib/ptbs/divisions";

export const Route = createFileRoute("/ptbs/master-data/divisions")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Divisions | PTBS Master Data" },
      { name: "description", content: "Manage business divisions used across PTBS." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DivisionsPage,
});

const PAGE_SIZE = 10;
type SortKey = "division_code" | "division_name" | "display_order" | "created_at" | "updated_at";

function DivisionsPage() {
  const [rows, setRows] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DivisionStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("display_order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Division | null>(null);
  const [viewing, setViewing] = useState<Division | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Division | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setRows(await listDivisions());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load divisions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!s) return true;
      return (
        r.division_code.toLowerCase().includes(s) ||
        r.division_name.toLowerCase().includes(s)
      );
    });
    out = [...out].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [rows, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  return (
    <PageContainer>
      <WorkspaceHeader
        title="Divisions"
        description="Business divisions used to group services and reporting throughout PTBS."
      />

      <DashboardCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by code or name…"
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Division
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="Code" active={sortKey==="division_code"} dir={sortDir} onClick={() => toggleSort("division_code")} />
                <SortHead label="Name" active={sortKey==="division_name"} dir={sortDir} onClick={() => toggleSort("division_name")} />
                <TableHead>Description</TableHead>
                <SortHead label="Order" active={sortKey==="display_order"} dir={sortDir} onClick={() => toggleSort("display_order")} />
                <TableHead>Status</TableHead>
                <SortHead label="Created" active={sortKey==="created_at"} dir={sortDir} onClick={() => toggleSort("created_at")} />
                <SortHead label="Updated" active={sortKey==="updated_at"} dir={sortDir} onClick={() => toggleSort("updated_at")} />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell></TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No divisions found.
                </TableCell></TableRow>
              ) : pageRows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-sm">{d.division_code}</TableCell>
                  <TableCell className="font-medium">{d.division_name}</TableCell>
                  <TableCell className="max-w-[280px] truncate text-muted-foreground">{d.description ?? "—"}</TableCell>
                  <TableCell>{d.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === "Active" ? "default" : "secondary"}>{d.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(d.created_at)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(d.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(d)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(d); setFormOpen(true); }} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setArchiveTarget(d)} title="Archive" disabled={d.status === "Inactive"}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </DashboardCard>

      <DivisionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={refresh}
      />

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.division_name}</DialogTitle>
            <DialogDescription className="font-mono">{viewing?.division_code}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <Field label="Description" value={viewing.description || "—"} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Display Order" value={String(viewing.display_order)} />
                <Field label="Status" value={viewing.status} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Created" value={formatDate(viewing.created_at)} />
                <Field label="Updated" value={formatDate(viewing.updated_at)} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive division?</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget?.division_name} will be marked <b>Inactive</b>. It stays visible for historical purposes but cannot be selected in future modules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!archiveTarget) return;
                try {
                  await archiveDivision(archiveTarget.id);
                  toast.success("Division archived");
                  setArchiveTarget(null);
                  refresh();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to archive");
                }
              }}
            >Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

function SortHead({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <TableHead>
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-40"}`} />
        {active && <span className="sr-only">{dir}</span>}
      </button>
    </TableHead>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  );
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function DivisionFormDialog({
  open, onOpenChange, editing, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Division | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<string>("0");
  const [status, setStatus] = useState<DivisionStatus>("Active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editing?.division_name ?? "");
      setDescription(editing?.description ?? "");
      setOrder(String(editing?.display_order ?? 0));
      setStatus((editing?.status as DivisionStatus) ?? "Active");
    }
  }, [open, editing]);

  async function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) { toast.error("Division Name is required"); return; }
    const orderNum = Number(order);
    if (!Number.isFinite(orderNum) || Number.isNaN(orderNum)) {
      toast.error("Display Order must be numeric"); return;
    }
    const input: DivisionInput = {
      division_name: trimmedName,
      description: description.trim() || null,
      display_order: Math.trunc(orderNum),
      status,
    };
    setSaving(true);
    try {
      if (editing) {
        await updateDivision(editing.id, input);
        toast.success("Division updated");
      } else {
        const created = await createDivision(input);
        toast.success(`Division created (${created.division_code})`);
      }
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      const msg = err?.message ?? "Failed to save";
      if (/duplicate|unique/i.test(msg)) {
        toast.error("A division with that name already exists");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Division" : "Add Division"}</DialogTitle>
          <DialogDescription>
            {editing ? (
              <>Code <span className="font-mono">{editing.division_code}</span> is generated automatically and cannot be changed.</>
            ) : (
              <>Division Code will be generated automatically on save.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="d-name">Division Name *</Label>
            <Input id="d-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Printing & Branding" />
          </div>
          <div>
            <Label htmlFor="d-desc">Description</Label>
            <Textarea id="d-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="d-order">Display Order *</Label>
              <Input id="d-order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DivisionStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Save Changes" : "Create Division"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
