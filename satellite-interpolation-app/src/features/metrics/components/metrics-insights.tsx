import React from 'react';
import { ValidationInsights } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lightbulb, Trophy, AlertTriangle } from 'lucide-react';

interface MetricsInsightsProps {
  insights: ValidationInsights;
}

export function MetricsInsights({ insights }: MetricsInsightsProps) {
  return (
    <Card className="bg-blue-500/5 border-blue-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2 text-blue-500 uppercase tracking-wider">
          <Lightbulb className="w-5 h-5" />
          Validation Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="flex flex-col gap-2 p-4 bg-background rounded-lg border">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold mb-1">
            <Trophy className="w-4 h-4" />
            Top Performing Metric: {insights.bestMetric}
          </div>
          <p className="text-sm text-muted-foreground">
            The interpolation algorithm heavily prioritized <strong className="text-foreground">Structural Similarity</strong>, maintaining structural integrity flawlessly between the bounding T0 and T1 frames.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-background rounded-lg border">
          <div className="flex items-center gap-2 text-amber-500 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4" />
            Weakest Metric: {insights.weakestMetric}
          </div>
          <p className="text-sm text-muted-foreground">
            While <strong className="text-foreground">ISSM</strong> is acceptable, slight information loss occurred during the latent generation phase. This is typical for diffusion-based or flow-based intermediate interpolation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
