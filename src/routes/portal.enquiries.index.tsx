import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Inbox } from "lucide-react";
import { format } from "date-fns";
import { enquiriesQuery } from "@/lib/portal/enquiries";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { EmptyState } from "@/components/portal/EmptyState";
import { Button } from "@/components/ui/button";
import {
  EnquiryStatusBadge,
  EnquiryPriorityBadge,
} from "@/components/portal/EnquiryStatusBadge";

export const Route = createFileRoute("/portal/enquiries/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Enquiries | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyEnquiriesPage,
});

function MyEnquiriesPage() {
  const { data, isLoading, error } = useQuery(enquiriesQuery());

  if (isLoading) return <LoadingScreen />;
  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load enquiries: {error.message}
      </div>
    );
  }

  const enquiries = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">My Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track requests you've submitted for new work.
          </p>
        </div>
        <Button asChild>
          <Link to="/portal/enquiries/new">
            <Plus className="mr-2 h-4 w-4" /> New Enquiry
          </Link>
        </Button>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No enquiries yet"
          description="Submit your first enquiry to request new work from our team."
          action={
            <Button asChild>
              <Link to="/portal/enquiries/new">
                <Plus className="mr-2 h-4 w-4" /> New Enquiry
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {enquiries.map((e) => (
              <Link
                key={e.id}
                to="/portal/enquiries/$enquiryId"
                params={{ enquiryId: e.id }}
                className="block rounded-lg border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground">{e.title}</h3>
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
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-soft sm:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((e) => (
                  <tr
                    key={e.id}
                    className="cursor-pointer transition-colors hover:bg-accent/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/portal/enquiries/$enquiryId"
                        params={{ enquiryId: e.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {e.title}
                      </Link>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
