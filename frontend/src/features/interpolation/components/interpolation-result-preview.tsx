"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { InterpolationJobState } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/features/metadata/utils/formatters';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface InterpolationResultPreviewProps {
  jobState: InterpolationJobState;
}

export function InterpolationResultPreview({ jobState }: InterpolationResultPreviewProps) {
  if (jobState.status !== 'completed' || !jobState.outputFrame) return null;

  const frame = jobState.outputFrame;

  return (
    <Card className="overflow-hidden border-primary/50 shadow-md">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Generated Result (T0.5)</span>
          <span className="text-sm font-normal text-muted-foreground">Ratio: {jobState.config.timeRatio.toFixed(2)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[400px]">
          <div className="md:col-span-3 border-r p-4 bg-background">
            <div className="w-full h-full min-h-[300px] md:min-h-[400px] border rounded overflow-hidden">
              <Plot
                data={[
                  {
                    z: frame.data,
                    type: 'heatmap',
                    colorscale: 'Inferno',
                    zmin: frame.min,
                    zmax: frame.max,
                    showscale: true,
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 20, r: 10, b: 20, t: 10 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  xaxis: { title: { text: '' }, showgrid: false, zeroline: false },
                  yaxis: { title: { text: '' }, showgrid: false, zeroline: false, autorange: 'reversed' },
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
                config={{ displayModeBar: false, responsive: true }}
              />
            </div>
          </div>
          
          <div className="p-6 flex flex-col gap-6 bg-muted/10">
            <h4 className="font-semibold text-sm border-b pb-2">Output Metadata</h4>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Generated Timestamp</span>
              <span className="text-sm font-medium">{formatDate(frame.timestamp)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Interpolation Ratio</span>
              <span className="text-sm font-medium">{jobState.config.timeRatio.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Frame Type</span>
              <span className="text-sm font-medium text-primary">T0.5</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Dimensions</span>
              <span className="text-sm font-medium">{frame.dimensions.join(' × ')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
