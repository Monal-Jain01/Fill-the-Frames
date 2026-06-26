import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricsResponse } from '@/lib/api/validation-client';

interface OverallQualityScoreProps {
  metrics: MetricsResponse;
}

export function OverallQualityScore({ metrics }: OverallQualityScoreProps) {
  const score = typeof metrics.quality_score === 'number' ? metrics.quality_score : 0;

  // We can calculate a color band based on the backend quality score
  let statusColor = "text-red-500";
  let statusText = "Poor";
  
  if (score >= 90) {
    statusColor = "text-emerald-500";
    statusText = "Excellent";
  } else if (score >= 75) {
    statusColor = "text-blue-500";
    statusText = "Good";
  } else if (score >= 50) {
    statusColor = "text-amber-500";
    statusText = "Fair";
  }

  return (
    <Card className="bg-primary/5 border-primary/20 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldCheck className="w-32 h-32" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Overall Validation Score
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{score}</span>
              <span className="text-xl text-muted-foreground">/ 100</span>
            </div>
            <p className="text-sm text-muted-foreground">{metrics.summary}</p>
          </div>
          
          <div className="flex flex-col gap-1 md:text-right">
            <span className="text-sm font-medium text-muted-foreground uppercase">Quality Band</span>
            <span className={cn("text-2xl font-bold capitalize", statusColor)}>
              {statusText} Accuracy
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
