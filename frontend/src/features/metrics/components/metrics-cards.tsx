import React from 'react';
import { MetricData } from '../types';
import { CATEGORY_COLORS, STATUS_COLORS, STATUS_BG_COLORS } from '../constants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  metrics: MetricData[];
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className={cn("border-2 transition-all hover:scale-105", STATUS_BG_COLORS[metric.status])}>
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="font-bold text-lg">{metric.type}</span>
              <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold", CATEGORY_COLORS[metric.category])}>
                {metric.category}
              </Badge>
            </div>
            
            <div className="flex flex-col">
              <span className={cn("text-3xl font-black", STATUS_COLORS[metric.status])}>
                {metric.value.toFixed(3)}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                {metric.status}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
