import React from 'react';
import { DifferenceMapData } from '../types';
import { Card, CardContent } from '@/components/ui/card';

interface DifferenceStatisticsProps {
  differenceMap: DifferenceMapData;
}

export function DifferenceStatistics({ differenceMap }: DifferenceStatisticsProps) {
  const stats = [
    { label: 'Mean Difference', value: differenceMap.meanDifference.toFixed(3) + ' K' },
    { label: 'Max Positive Difference', value: '+' + differenceMap.maxDifference.toFixed(2) + ' K' },
    { label: 'Max Negative Difference', value: differenceMap.minDifference.toFixed(2) + ' K' },
    { label: 'Standard Deviation', value: differenceMap.stdDeviation.toFixed(3) + ' K' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, idx) => (
        <Card key={idx} className="bg-muted/10">
          <CardContent className="p-4 flex flex-col gap-1 text-center">
            <span className="text-xs text-muted-foreground uppercase">{stat.label}</span>
            <span className="text-lg font-mono text-primary font-medium">{stat.value}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
