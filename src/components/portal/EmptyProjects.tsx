import { FolderKanban } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function EmptyProjects() {
  return (
    <EmptyState
      icon={FolderKanban}
      title="No active projects yet"
      description="You currently have no active projects. Once our team creates a project for you, it will appear here."
    />
  );
}
