import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MetricsResponse } from '@/lib/api/validation-client';

interface MetricsCardsProps {
  metrics: MetricsResponse;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const displayMetrics = [
    { id: 'ssim', label: 'SSIM', value: metrics.ssim, type: 'Structural', better: 'higher' },
    { id: 'psnr', label: 'PSNR', value: metrics.psnr, type: 'Noise', better: 'higher' },
    { id: 'mse', label: 'MSE', value: metrics.mse, type: 'Error', better: 'lower' },
    { id: 'fsim', label: 'FSIM', value: metrics.fsim, type: 'Feature', better: 'higher' },
    { id: 'issm', label: 'ISSM', value: metrics.issm, type: 'Info', better: 'higher' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {displayMetrics.map((metric) => (
        <Card key={metric.id} className="border-2 transition-all hover:scale-105 bg-background">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="font-bold text-lg">{metric.label}</span>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-blue-500 border-blue-500">
                {metric.type}
              </Badge>
            </div>
            
            <div className="flex flex-col">
              <span className={cn("text-3xl font-black", metric.value === null ? "text-muted-foreground text-xl" : "text-foreground")}>
                {metric.value !== null ? metric.value.toFixed(3) : "Pending"}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                {metric.value === null ? "Not Available" : `Target: ${metric.better}`}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
