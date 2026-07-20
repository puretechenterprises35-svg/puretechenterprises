import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Paperclip,
  Download,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Rocket,
  FolderCheck,
  FileSignature,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import {
  EnquiryStatusBadge,
  EnquiryPriorityBadge,
} from "@/components/portal/EnquiryStatusBadge";
import { QuotationStatusBadge } from "@/components/portal/QuotationStatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  adminEnquiryDetailQuery,
  getAttachmentUrl,
  updateEnquiryAdmin,
  convertEnquiryToProject,
  getProjectByEnquiryId,
  type EnquiryStatus,
} from "@/lib/portal/enquiries";
import { quotationsByEnquiryQuery, formatMoney } from "@/lib/portal/quotations";
import { usePortalSession } from "@/hooks/use-portal-session";

const STATUSES: EnquiryStatus[] = [
  "Pending Review",
  "Needs More Information",
  "Approved",
  "Rejected",
  "Converted to Project",
];

export const Route = createFileRoute("/admin/enquiries/$enquiryId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Enquiry | Puretech Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEnquiryDetailPage,
});

type ConfirmAction = {
  label: string;
  status: EnquiryStatus;
  destructive?: boolean;
};

function AdminEnquiryDetailPage() {
  const { enquiryId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { session } = usePortalSession();
  const { data, isLoading, error } = useQuery(adminEnquiryDetailQuery(enquiryId));

  const [status, setStatus] = useState<EnquiryStatus>("Pending Review");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<ConfirmAction | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);

  const linkedProjectQuery = useQuery({
    queryKey: ["admin", "enquiry-project", enquiryId],
    queryFn: () => getProjectByEnquiryId(enquiryId),
  });

  const quotationsQuery = useQuery(quotationsByEnquiryQuery(enquiryId));

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setNotes(data.admin_notes ?? "");
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (patch: { status?: EnquiryStatus; admin_notes?: string | null }) =>
      updateEnquiryAdmin(enquiryId, patch),
    onSuccess: () => {
      toast.success("Enquiry updated");
      qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
      qc.invalidateQueries({ queryKey: ["portal", "enquiries"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const acceptedQuotation = (quotationsQuery.data ?? []).find(
    (q) => q.status === "Accepted"
  );

  const convertMutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("Enquiry not loaded");
      if (!session?.user?.id) throw new Error("Not authenticated");
      return convertEnquiryToProject(data, session.user.id, acceptedQuotation?.id ?? null);
    },
    onSuccess: (project) => {
      toast.success("Enquiry converted to project");
      qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["admin", "enquiry-project", enquiryId] });
      qc.invalidateQueries({ queryKey: ["portal", "projects"] });
      qc.invalidateQueries({ queryKey: ["portal", "enquiries"] });
      qc.invalidateQueries({ queryKey: ["portal", "notifications"] });
      setConvertOpen(false);
      navigate({ to: "/admin/projects/$projectId", params: { projectId: project.id } });
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setConvertOpen(false);
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error || !data) {
    return (
      <AdminShell title="Enquiry">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load enquiry: {error?.message ?? "Not found"}
        </div>
      </AdminShell>
    );
  }

  const client = data.client;

  const openAttachment = async (path: string) => {
    try {
      const url = await getAttachmentUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open file");
    }
  };

  const saveAll = () =>
    mutation.mutate({ status, admin_notes: notes.trim() ? notes : null });

  const runAction = (action: ConfirmAction) => {
    setStatus(action.status);
    mutation.mutate({
      status: action.status,
      admin_notes: notes.trim() ? notes : null,
    });
    setPending(null);
  };

  const quotations = quotationsQuery.data ?? [];
  const hasQuotation = quotations.length > 0;

  return (
    <AdminShell title="Enquiry Details">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/enquiries">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to enquiries
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
                    ? `KES ${data.estimated_budget.toLocaleString()}`
                    : "—"
                }
              />
              <Field
                label="Last Updated"
                value={format(new Date(data.updated_at), "PPP")}
              />
            </dl>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground">
                Description
              </h2>
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
          </div>

          {hasQuotation && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-sm font-semibold text-foreground">
                Quotations ({quotations.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {quotations.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-muted-foreground">
                        {q.quote_number}
                      </span>
                      <span className="font-medium">{q.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMoney(q.total_amount, q.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QuotationStatusBadge status={q.status} />
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          to="/admin/quotations/$quotationId"
                          params={{ quotationId: q.id }}
                        >
                          <ExternalLink className="mr-1 h-4 w-4" /> Open
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-primary">
              Admin Notes (internal)
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Only administrators can see this. Not visible to clients.
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Add internal notes about this enquiry…"
              className="mt-3 bg-background"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-foreground">Client</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Name" value={client?.contact_person || client?.full_name || "—"} />
              <Row label="Company" value={client?.company_name || "—"} />
              <Row label="Email" value={client?.email || "—"} />
              <Row label="Phone" value={client?.phone_number || "—"} />
              <Row label="Address" value={client?.business_address || "—"} />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-semibold text-foreground">Status</h2>
            <div className="mt-3">
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as EnquiryStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                onClick={saveAll}
                disabled={mutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  setPending({ label: "Approve Enquiry", status: "Approved" })
                }
                disabled={mutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Enquiry
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  setPending({
                    label: "Request More Information",
                    status: "Needs More Information",
                  })
                }
                disabled={mutation.isPending}
              >
                <HelpCircle className="mr-2 h-4 w-4" /> Request More Information
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  setPending({
                    label: "Reject Enquiry",
                    status: "Rejected",
                    destructive: true,
                  })
                }
                disabled={mutation.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject Enquiry
              </Button>
            </div>

            {/* Create Quotation — only after Approved */}
            {data.status === "Approved" && !linkedProjectQuery.data && (
              <div className="mt-4">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() =>
                    navigate({
                      to: "/admin/quotations/new",
                      search: { enquiryId: data.id },
                    })
                  }
                >
                  <FileSignature className="mr-2 h-4 w-4" /> Create Quotation
                </Button>
                {hasQuotation && !acceptedQuotation && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Waiting for the client to accept the quotation before you can
                    convert to a project.
                  </p>
                )}
              </div>
            )}

            {/* Convert to Project — only after a quotation is Accepted */}
            {linkedProjectQuery.data ? (
              <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                  <FolderCheck className="h-4 w-4" /> Project Created ✓
                </div>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0 text-xs"
                >
                  <Link
                    to="/admin/projects/$projectId"
                    params={{ projectId: linkedProjectQuery.data.id }}
                  >
                    View {linkedProjectQuery.data.project_name}
                  </Link>
                </Button>
              </div>
            ) : acceptedQuotation ? (
              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={() => setConvertOpen(true)}
                  disabled={convertMutation.isPending}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  {convertMutation.isPending ? "Converting…" : "Convert to Project"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        title="Convert this enquiry into a project?"
        description={
          <>
            A new project will be created for <strong>{data.title}</strong>,
            linked to accepted quotation{" "}
            <strong>{acceptedQuotation?.quote_number}</strong>. The enquiry will
            be marked as <strong>Converted to Project</strong> and the client
            will see it immediately.
          </>
        }
        confirmLabel={convertMutation.isPending ? "Converting…" : "Convert"}
        onConfirm={() => convertMutation.mutate()}
      />

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
        title={`${pending?.label ?? ""}?`}
        description={
          <>
            This will set the status to{" "}
            <strong>{pending?.status}</strong>. The client will see the change
            immediately.
          </>
        }
        confirmLabel={pending?.label ?? "Confirm"}
        destructive={pending?.destructive}
        onConfirm={() => pending && runAction(pending)}
      />
    </AdminShell>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-foreground break-words">
        {value}
      </dd>
    </div>
  );
}
