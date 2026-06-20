import { LucideIcon } from 'lucide-react';

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center animate-in fade-in-50 duration-500">
      {Icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
