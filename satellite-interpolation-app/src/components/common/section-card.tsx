import * as React from 'react';
import { cn } from '@/lib/utils';

export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}>
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50">
          {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
