export function WorkspaceHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-border pb-4">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
