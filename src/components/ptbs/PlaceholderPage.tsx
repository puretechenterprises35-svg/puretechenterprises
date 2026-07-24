import { Construction } from "lucide-react";
import { PageContainer } from "./PageContainer";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { DashboardCard } from "./DashboardCard";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <PageContainer>
      <WorkspaceHeader title={title} />
      <DashboardCard>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Construction className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            This feature will be implemented in the next development sprint.
          </p>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
