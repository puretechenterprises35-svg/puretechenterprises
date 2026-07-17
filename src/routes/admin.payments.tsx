import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentTable } from "@/components/invoices/PaymentTable";
import {
  adminPaymentsQuery,
  useSetPaymentVerification,
  type VerificationStatus,
} from "@/lib/invoices/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

function AdminPayments() {
  const payQ = useQuery(adminPaymentsQuery());
  const verify = useSetPaymentVerification();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VerificationStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (payQ.data ?? []).filter((p) => {
      if (status !== "all" && p.verification_status !== status) return false;
      if (!q) return true;
      return (
        (p.invoice?.invoice_number ?? "").toLowerCase().includes(q) ||
        (p.client?.company_name ?? "").toLowerCase().includes(q) ||
        (p.payment_reference ?? "").toLowerCase().includes(q)
      );
    });
  }, [payQ.data, search, status]);

  return (
    <AdminShell title="Payments">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {payQ.isLoading ? (
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
      ) : (
        <PaymentTable
          payments={filtered}
          showClient
          actions={(p) => (
            <div className="flex items-center justify-end gap-1">
              {p.verification_status !== "Verified" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await verify.mutateAsync({ id: p.id, status: "Verified" });
                    toast.success("Verified");
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </Button>
              )}
              {p.verification_status !== "Rejected" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await verify.mutateAsync({ id: p.id, status: "Rejected" });
                    toast.success("Rejected");
                  }}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        />
      )}
    </AdminShell>
  );
}
