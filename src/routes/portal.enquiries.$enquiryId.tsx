import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Paperclip, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  enquiryDetailQuery,
  getAttachmentUrl,
} from "@/lib/portal/enquiries";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { formatMoney } from "@/lib/portal/quotations";
import { Button } from "@/components/ui/button";
import {
  EnquiryStatusBadge,
  EnquiryPriorityBadge,
} from "@/components/portal/EnquiryStatusBadge";

export const Route = createFileRoute("/portal/enquiries/$enquiryId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Enquiry | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EnquiryDetailPage,
});

function EnquiryDetailPage() {
  const { enquiryId } = Route.useParams();
  const { data, isLoading, error } = useQuery(enquiryDetailQuery(enquiryId));

  if (isLoading) return <LoadingScreen />;
  if (error || !data) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load enquiry: {error?.message ?? "Not found"}
      </div>
    );
  }

  const openAttachment = async (path: string) => {
    try {
      const url = await getAttachmentUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open file");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/portal/enquiries">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to enquiries
        </Link>
      </Button>

      <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted {format(new Date(data.created_at), "PPP")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <EnquiryStatusBadge status={data.status} />
            <EnquiryPriorityBadge priority={data.priority} />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Service" value={data.service_category} />
          <Field
            label="Preferred Completion Date"
            value={
              data.preferred_completion_date
                ? format(new Date(data.preferred_completion_date), "PPP")
                : "—"
            }
          />
          <Field
            label="Estimated Budget"
            value={
              data.estimated_budget != null
                ? formatMoney(data.estimated_budget)
                : "—"
            }
          />
          <Field
            label="Last Updated"
            value={format(new Date(data.updated_at), "PPP")}
          />
        </dl>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {data.description}
          </p>
        </div>

        {data.attachments.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">
              Attachments ({data.attachments.length})
            </h2>
            <ul className="mt-2 space-y-2">
              {data.attachments.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{a.name}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAttachment(a.path)}
                  >
                    <Download className="mr-1 h-4 w-4" /> Open
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Admin Notes are intentionally hidden from clients. */}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
