import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { adminClientsQuery, useCreateProject } from "@/lib/admin/queries";

export const Route = createFileRoute("/admin/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  const clients = useQuery(adminClientsQuery());
  const create = useCreateProject();
  const navigate = useNavigate();

  return (
    <AdminShell title="New project">
      <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <ProjectForm
          clients={clients.data ?? []}
          submitLabel="Create project"
          submitting={create.isPending}
          onSubmit={async (values) => {
            try {
              const id = await create.mutateAsync(values);
              toast.success("Project created");
              navigate({ to: "/admin/projects/$projectId", params: { projectId: id } });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed to create");
            }
          }}
        />
      </div>
    </AdminShell>
  );
}
