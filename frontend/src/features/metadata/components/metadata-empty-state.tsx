import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface MetadataEmptyStateProps {
  message?: string;
  description?: string;
}

export function MetadataEmptyState({ 
  message = "No Metadata Available", 
  description = "Upload a satellite observation file to view its metadata and properties." 
}: MetadataEmptyStateProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-secondary/50 p-4 mb-4 text-muted-foreground">
          <Database className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{message}</h3>
        <p className="text-muted-foreground max-w-sm">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
