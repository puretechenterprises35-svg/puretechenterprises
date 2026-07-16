import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminClientsQuery, useUpdateClientApproval, useUpdateClientStatus, type AdminClientRow, type ApprovalStatus } from "@/lib/admin/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export const Route = createFileRoute("/admin/clients")({
  component: AdminClientsPage,
});

const PAGE_SIZE = 10;

function statusTone(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "Active" || s === "approved") return "default";
  if (s === "pending") return "secondary";
  if (s === "rejected" || s === "suspended" || s === "Suspended") return "destructive";
  return "outline";
}

function AdminClientsPage() {
  const q = useQuery(adminClientsQuery());
  const approval = useUpdateClientApproval();
  const clientStatus = useUpdateClientStatus();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ApprovalStatus>("all");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<null | {
    title: string; description: string; action: () => Promise<void>; destructive?: boolean;
  }>(null);

  const filtered = useMemo(() => {
    const items = q.data ?? [];
    const term = search.toLowerCase().trim();
    return items.filter((c) => {
      if (filter !== "all" && c.approval_status !== filter) return false;
      if (!term) return true;
      return [c.company_name, c.contact_person, c.email, c.phone, c.full_name]
        .some((v) => v?.toLowerCase().includes(term));
    });
  }, [q.data, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const runApproval = (c: AdminClientRow, status: ApprovalStatus, verb: string) =>
    setConfirm({
      title: `${verb} client?`,
      description: `${verb} ${c.company_name || c.email || "this client"}?`,
      destructive: status === "rejected" || status === "suspended",
      action: async () => {
        try {
          await approval.mutateAsync({ authUserId: c.auth_user_id, status });
          if (status === "approved") await clientStatus.mutateAsync({ clientId: c.id, status: "Active" });
          if (status === "suspended") await clientStatus.mutateAsync({ clientId: c.id, status: "Suspended" });
          toast.success(`Client ${verb.toLowerCase()}d`);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Failed");
        }
      },
    });

  return (
    <AdminShell title="Clients">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search clients…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
        <Select value={filter} onValueChange={(v) => { setFilter(v as typeof filter); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-soft">
        {q.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading clients…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.company_name || "—"}</TableCell>
                    <TableCell>{c.contact_person || c.full_name || "—"}</TableCell>
                    <TableCell className="text-sm">{c.email || "—"}</TableCell>
                    <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                    <TableCell><Badge variant={statusTone(c.approval_status)}>{c.approval_status}</Badge></TableCell>
                    <TableCell><Badge variant={statusTone(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {c.approval_status !== "approved" && (
                            <DropdownMenuItem onClick={() => runApproval(c, "approved", "Approve")}>Approve</DropdownMenuItem>
                          )}
                          {c.approval_status !== "rejected" && (
                            <DropdownMenuItem onClick={() => runApproval(c, "rejected", "Reject")}>Reject</DropdownMenuItem>
                          )}
                          {c.approval_status !== "suspended" && (
                            <DropdownMenuItem onClick={() => runApproval(c, "suspended", "Suspend")}>Suspend</DropdownMenuItem>
                          )}
                          {(c.approval_status === "suspended" || c.approval_status === "rejected") && (
                            <DropdownMenuItem onClick={() => runApproval(c, "approved", "Reactivate")}>Reactivate</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border p-3 text-sm">
          <span className="text-muted-foreground">{filtered.length} client{filtered.length === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="text-xs text-muted-foreground">Page {page} / {pageCount}</span>
            <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        destructive={confirm?.destructive}
        onConfirm={() => {
          const c = confirm;
          setConfirm(null);
          void c?.action();
        }}
      />
    </AdminShell>
  );
}
