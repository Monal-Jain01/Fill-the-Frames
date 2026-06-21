import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export function ComparisonEmptyState() {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div className="rounded-full bg-secondary/50 p-4 mb-4 text-muted-foreground">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Frames Available</h3>
        <p className="text-muted-foreground max-w-sm">
          You must generate interpolated frames first before they can be compared.
        </p>
      </CardContent>
    </Card>
  );
}
