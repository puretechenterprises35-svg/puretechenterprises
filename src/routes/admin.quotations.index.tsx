import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { QuotationStatusBadge } from "@/components/portal/QuotationStatusBadge";
import { adminQuotationsQuery, formatMoney } from "@/lib/portal/quotations";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/quotations/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Quotations | Puretech Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminQuotationsPage,
});

function AdminQuotationsPage() {
  const { data, isLoading, error } = useQuery(adminQuotationsQuery());

  return (
    <AdminShell title="Quotations">
      <div className="mb-4 flex justify-end">
        <Button asChild variant="outline">
          <Link to="/admin/enquiries">
            <FileText className="mr-2 h-4 w-4" /> New Quotation (from Enquiry)
          </Link>
        </Button>
      </div>


      {isLoading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : !data?.length ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No quotations yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((q) => (
                <tr key={q.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{q.quote_number}</td>
                  <td className="px-4 py-3">{q.title}</td>
                  <td className="px-4 py-3">
                    {q.client?.company_name || q.client?.contact_person || "—"}
                  </td>
                  <td className="px-4 py-3">{formatMoney(q.total_amount, q.currency)}</td>
                  <td className="px-4 py-3">
                    <QuotationStatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(q.created_at), "PP")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to="/admin/quotations/$quotationId"
                        params={{ quotationId: q.id }}
                      >
                        Open
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
