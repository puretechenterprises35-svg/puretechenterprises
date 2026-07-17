import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { adminInvoicesQuery, INVOICE_STATUSES, type InvoiceStatus } from "@/lib/invoices/queries";

export const Route = createFileRoute("/admin/invoices")({
  component: AdminInvoices,
});

function AdminInvoices() {
  const invQ = useQuery(adminInvoicesQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (invQ.data ?? []).filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (!q) return true;
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.title.toLowerCase().includes(q) ||
        (inv.client?.company_name ?? "").toLowerCase().includes(q) ||
        (inv.project?.project_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [invQ.data, search, status]);

  return (
    <AdminShell title="Invoices">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {INVOICE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New invoice
        </Button>
      </div>

      {invQ.isLoading ? (
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
      ) : (
        <InvoiceTable invoices={filtered} adminHref showClient />
      )}

      <InvoiceForm open={open} onOpenChange={setOpen} />
    </AdminShell>
  );
}
