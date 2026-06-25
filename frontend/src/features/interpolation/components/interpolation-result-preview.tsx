"use client";

import React from 'react';
import { InterpolationJobState } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useVisualization } from '@/features/visualization/hooks/use-visualization';
import { SatelliteViewer } from '@/features/visualization/components/satellite-viewer';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/features/metadata/utils/formatters';

interface InterpolationResultPreviewProps {
  jobState: InterpolationJobState;
}

export function InterpolationResultPreview({ jobState }: InterpolationResultPreviewProps) {
  if (jobState.status !== 'completed' || !jobState.outputFileId) return null;

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
          <div className="md:col-span-3 border-r bg-background">
            <PreviewWrapper fileId={jobState.outputFileId} />
          </div>
          
          <div className="p-6 flex flex-col gap-6 bg-muted/10">
            <h4 className="font-semibold text-sm border-b pb-2">Output Info</h4>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Completed At</span>
              <span className="text-sm font-medium">{jobState.completedAt ? formatDate(jobState.completedAt) : 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Interpolation Ratio</span>
              <span className="text-sm font-medium">{jobState.config.timeRatio.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Variable Generated</span>
              <span className="text-sm font-medium">{jobState.config.variable || 'C13'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Frame Type</span>
              <span className="text-sm font-medium text-primary">T0.5</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Separate wrapper component to use the visualization hook cleanly
function PreviewWrapper({ fileId }: { fileId: string }) {
  const vis = useVisualization(fileId);

  if (vis.state === 'loading') {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading generated frame visualization...</p>
      </div>
    );
  }

  // Allow passing even if data is null, as long as we have layerUrl (for leaflet maps)
  if (vis.state === 'error') {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center p-4">
        <p className="text-destructive">Failed to load frame visualization.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <SatelliteViewer 
        layerUrl={vis.layerUrl}
        bounds={vis.bounds}
        data={vis.data}
        colorMap={vis.colorMap}
        onHover={vis.handleHover}
        onUnhover={vis.handleUnhover}
      />
    </div>
  );
}