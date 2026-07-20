import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { QuotationStatusBadge } from "@/components/portal/QuotationStatusBadge";
import { clientQuotationsQuery, formatMoney } from "@/lib/portal/quotations";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/portal/quotations/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Quotations | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientQuotationsPage,
});

function ClientQuotationsPage() {
  const { data, isLoading, error } = useQuery(clientQuotationsQuery());

  if (isLoading) return <LoadingScreen />;
  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">My Quotations</h1>
      {!data?.length ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          You don't have any quotations yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((q) => (
                <tr key={q.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{q.quote_number}</td>
                  <td className="px-4 py-3">{q.title}</td>
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
                        to="/portal/quotations/$quotationId"
                        params={{ quotationId: q.id }}
                      >
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
