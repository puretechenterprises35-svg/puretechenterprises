import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Inbox, Search, Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { EmptyState } from "@/components/portal/EmptyState";
import {
  EnquiryStatusBadge,
  EnquiryPriorityBadge,
} from "@/components/portal/EnquiryStatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminEnquiriesQuery, type EnquiryStatus } from "@/lib/portal/enquiries";

const STATUSES: (EnquiryStatus | "All")[] = [
  "All",
  "Pending Review",
  "Needs More Information",
  "Approved",
  "Rejected",
  "Converted to Project",
];
const PAGE_SIZE = 15;

export const Route = createFileRoute("/admin/enquiries/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Enquiries | Puretech Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const { data, isLoading, error } = useQuery(adminEnquiriesQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "All" && r.status !== status) return false;
      if (!q) return true;
      const hay = [
        r.title,
        r.service_category,
        r.client?.company_name,
        r.client?.contact_person,
        r.client?.full_name,
        r.client?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <AdminShell title="Enquiries">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, service, client…"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as (typeof STATUSES)[number]);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Status" />
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

        {isLoading ? (
          <LoadingScreen />
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load enquiries: {error.message}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No enquiries found"
            description="No client enquiries match your current filters."
          />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {paged.map((e) => (
                <Link
                  key={e.id}
                  to="/admin/enquiries/$enquiryId"
                  params={{ enquiryId: e.id }}
                  className="block rounded-lg border border-border bg-card p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        {e.client?.company_name ||
                          e.client?.contact_person ||
                          e.client?.full_name ||
                          e.client?.email ||
                          "Unknown client"}
                      </p>
                      <h3 className="truncate font-medium text-foreground">
                        {e.title}
                      </h3>
                    </div>
                    <EnquiryPriorityBadge priority={e.priority} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.service_category}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <EnquiryStatusBadge status={e.status} />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(e.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-soft md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((e) => (
                    <tr key={e.id} className="hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {e.client?.company_name ||
                            e.client?.contact_person ||
                            e.client?.full_name ||
                            "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {e.client?.email ?? ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {e.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {e.service_category}
                      </td>
                      <td className="px-4 py-3">
                        <EnquiryPriorityBadge priority={e.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <EnquiryStatusBadge status={e.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(e.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            to="/admin/enquiries/$enquiryId"
                            params={{ enquiryId: e.id }}
                          >
                            <Eye className="mr-1 h-4 w-4" /> View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                <span>
                  Page {currentPage} of {totalPages} · {filtered.length} results
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
