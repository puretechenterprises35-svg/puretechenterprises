import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectsQueryOptions } from "@/lib/portal/projects";
import { ProjectTable } from "@/components/portal/ProjectTable";
import { ProjectFilters, type FilterState } from "@/components/portal/ProjectFilters";
import { EmptyProjects } from "@/components/portal/EmptyProjects";
import { LoadingScreen } from "@/components/portal/LoadingScreen";
import { usePortalRealtime } from "@/hooks/use-portal-realtime";

export const Route = createFileRoute("/portal/projects")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Projects | Puretech Client Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalProjects,
});

function PortalProjects() {
  usePortalRealtime();
  const { data: projects, isLoading, error } = useQuery(projectsQueryOptions());

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    service: "all",
    priority: "all",
    sort: "due_date",
  });

  const services = useMemo(() => {
    const set = new Set<string>();
    (projects ?? []).forEach((p) => p.service_category && set.add(p.service_category));
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    const list = (projects ?? []).filter((p) => {
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.priority !== "all" && p.priority !== filters.priority) return false;
      if (filters.service !== "all" && p.service_category !== filters.service) return false;
      if (filters.search && !p.project_name.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      return true;
    });
    const sorted = [...list].sort((a, b) => {
      if (filters.sort === "project_name") return a.project_name.localeCompare(b.project_name);
      if (filters.sort === "status") return a.status.localeCompare(b.status);
      // due_date: nulls last, ascending
      const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return ad - bd;
    });
    return sorted;
  }, [projects, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Track the progress of every engagement with Puretech.
        </p>
      </div>

      <ProjectFilters value={filters} onChange={setFilters} services={services} />

      {isLoading ? (
        <LoadingScreen label="Loading your projects…" />
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load projects. Please refresh and try again.
        </div>
      ) : (projects?.length ?? 0) === 0 ? (
        <EmptyProjects />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          No projects match your filters.
        </div>
      ) : (
        <ProjectTable projects={filtered} />
      )}
    </div>
  );
}
