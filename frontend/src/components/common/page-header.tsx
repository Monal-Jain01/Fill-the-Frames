export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8 space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
