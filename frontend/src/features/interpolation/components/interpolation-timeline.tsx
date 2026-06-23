import React from 'react';
import { InterpolationStatus } from '../types';
import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterpolationTimelineProps {
  status: InterpolationStatus;
}

const steps = [
  { id: 'idle', label: 'Idle' },
  { id: 'preparing', label: 'Preparing Data' },
  { id: 'processing', label: 'Running Inference' },
  { id: 'completed', label: 'Completed' },
];

export function InterpolationTimeline({ status }: InterpolationTimelineProps) {
  const currentIndex = steps.findIndex(s => s.id === status);
  const isError = status === 'error';

  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted -z-10" />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex || status === 'completed';
          const isCurrent = index === currentIndex;
          
          let Icon = CircleDashed;
          let iconClass = 'text-muted-foreground bg-background';
          
          if (isCompleted) {
            Icon = CheckCircle2;
            iconClass = 'text-primary bg-background';
          } else if (isCurrent) {
            Icon = Loader2;
            iconClass = 'text-blue-500 bg-background animate-spin';
          } else if (isError) {
            iconClass = 'text-destructive bg-background';
          }

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
              <Icon className={cn("w-6 h-6", iconClass)} />
              <span className={cn("text-xs font-medium", isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
