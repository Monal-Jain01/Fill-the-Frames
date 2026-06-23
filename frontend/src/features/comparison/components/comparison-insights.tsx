import React from 'react';
import { DifferenceMapData } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface ComparisonInsightsProps {
  differenceMap: DifferenceMapData;
}

export function ComparisonInsights({ differenceMap }: ComparisonInsightsProps) {
  return (
    <Card className="bg-blue-500/5 border-blue-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2 text-blue-500">
          <Lightbulb className="w-5 h-5" />
          Scientific Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2 text-muted-foreground">
        <p>
          The generated frame exhibits a high degree of similarity with the expected path, achieving a mock similarity score of <strong className="text-foreground">{differenceMap.similarityScore.toFixed(3)}</strong>.
        </p>
        <p>
          The most significant deviations occur at the periphery of the storm mass, indicating that the baseline interpolation model slightly underestimates the expansion rate of the thermal anomaly between T0 and T1.
        </p>
      </CardContent>
    </Card>
  );
}
