import React from 'react';
import { InterpolationJobState } from '../types';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface InterpolationStatusProps {
  jobState: InterpolationJobState;
}

export function InterpolationStatus({ jobState }: InterpolationStatusProps) {
  if (jobState.status === 'idle') return null;

  return (
    <Card className="bg-muted/10 border-dashed">
      <CardContent className="p-6">
        {jobState.status === 'error' ? (
          <div className="flex flex-col items-center justify-center gap-2 text-destructive">
            <AlertCircle className="w-8 h-8" />
            <span className="font-semibold">{jobState.error || 'An error occurred during interpolation.'}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize text-muted-foreground">{jobState.status}...</span>
              <span className="font-mono">{jobState.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-secondary">
              <Progress 
                value={jobState.progress} 
                className="h-full"
                indicatorClassName="bg-primary transition-all duration-300"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
