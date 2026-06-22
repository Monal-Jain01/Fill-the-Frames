import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ActivitySquare } from 'lucide-react';

export function MetricsEmptyState() {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div className="rounded-full bg-secondary/50 p-4 mb-4 text-muted-foreground animate-pulse">
          <ActivitySquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Calculating Metrics</h3>
        <p className="text-muted-foreground max-w-sm">
          Please wait while the validation framework evaluates the generated satellite frames against the structural baselines...
        </p>
      </CardContent>
    </Card>
  );
}
