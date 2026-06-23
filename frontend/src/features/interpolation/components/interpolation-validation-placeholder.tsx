import React from 'react';
import { InterpolationJobState } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

interface InterpolationValidationPlaceholderProps {
  jobState: InterpolationJobState;
}

export function InterpolationValidationPlaceholder({ jobState }: InterpolationValidationPlaceholderProps) {
  if (jobState.status !== 'completed') return null;

  return (
    <Card>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-md flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          Metrics Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded border border-dashed">
            <span className="text-sm font-semibold uppercase text-muted-foreground">SSIM</span>
            <span className="text-sm italic">Pending</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded border border-dashed">
            <span className="text-sm font-semibold uppercase text-muted-foreground">FSIM</span>
            <span className="text-sm italic">Pending</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded border border-dashed">
            <span className="text-sm font-semibold uppercase text-muted-foreground">PSNR</span>
            <span className="text-sm italic">Pending</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Full validation will be available in the Metrics Module.
        </p>
      </CardContent>
    </Card>
  );
}
