import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { PaymentTable } from "@/components/invoices/PaymentTable";
import {
  clientInvoiceSummaryQuery,
  formatCurrency,
  myInvoicesQuery,
  myPaymentsQuery,
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/lib/invoices/queries";
import { usePortalRealtime } from "@/hooks/use-portal-realtime";

export const Route = createFileRoute("/portal/payments")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Payments | Puretech Client Portal" }, { name: "robots", content: "noindex" }],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  usePortalRealtime();
  const summary = useQuery(clientInvoiceSummaryQuery());
  const invoices = useQuery(myInvoicesQuery());
  const payments = useQuery(myPaymentsQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "due" | "amount">("newest");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = (invoices.data ?? []).filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (!q) return true;
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.project?.project_name ?? "").toLowerCase().includes(q) ||
        inv.title.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === "amount") return b.total_amount - a.total_amount;
      if (sort === "due") return (a.due_date ?? "").localeCompare(b.due_date ?? "");
      if (sort === "oldest") return (a.issue_date ?? "").localeCompare(b.issue_date ?? "");
      return (b.issue_date ?? "").localeCompare(a.issue_date ?? "");
    });
    return list;
  }, [invoices.data, search, status, sort]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground">Track invoices, payment status, and history.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Outstanding" value={formatCurrency(summary.data?.outstanding ?? 0)} icon={CreditCard} tone="warning" />
        <StatCard label="Overdue" value={formatCurrency(summary.data?.overdue ?? 0)} icon={AlertCircle} tone="danger" />
        <StatCard label="Total Paid" value={formatCurrency(summary.data?.paid ?? 0)} icon={CheckCircle2} tone="success" />
        <StatCard label="Invoices" value={summary.data?.count ?? 0} icon={CreditCard} tone="default" />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {INVOICE_STATUSES.filter((s) => s !== "Draft").map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="due">Due date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {invoices.isLoading ? (
          <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
        ) : (
          <InvoiceTable invoices={filtered} />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent payments</h2>
          <Link to="/portal/payments" className="text-xs text-muted-foreground">.</Link>
        </div>
        {payments.isLoading ? (
          <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
        ) : (
          <PaymentTable payments={payments.data ?? []} />
        )}
      </section>
    </div>
  );
}
