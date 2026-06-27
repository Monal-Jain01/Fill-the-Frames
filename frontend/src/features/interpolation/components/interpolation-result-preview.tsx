"use client";

import React, { useEffect, useState } from 'react';
import { InterpolationJobState } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SatelliteViewer } from '@/features/visualization/components/satellite-viewer';
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
            <PreviewWrapper fileId={jobState.outputFileId} variable={jobState.config.variable} />
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
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Artifact ID</span>
              <div className="flex items-center justify-between bg-background p-2 rounded border">
                <span className="text-xs font-mono truncate mr-2">{jobState.outputFileId}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(jobState.outputFileId || '')}
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
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

import { visualizationClient } from '@/lib/api/visualization-client';
import { useInterpolationStore } from '@/store/interpolation-store';

// Separate wrapper component to bypass complex visualization hooks
function PreviewWrapper({ fileId, variable }: { fileId: string, variable?: string }) {
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const varName = variable || "C13";
  const t0FileId = useInterpolationStore(state => state.t0FileId);

  // Always prefer to get bounds from the raw unmodified T0 file if available
  const boundsTargetId = t0FileId || fileId;

  useEffect(() => {
    if (boundsTargetId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      visualizationClient.getBounds(boundsTargetId, varName).then(res => {
        if (res.success && res.data && res.data.bounds) {
          const [[south, west], [north, east]] = res.data.bounds;
          setBounds([south, west, north, east]);
        }
      }).catch(console.error)
      .finally(() => setIsLoading(false));
    }
  }, [boundsTargetId, varName]);

  const generatedLayerUrl = visualizationClient.getLayerUrl(fileId, varName);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col gap-4 items-center justify-center bg-muted/10 border rounded-lg animate-pulse">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Fetching geographic coordinates...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <SatelliteViewer 
        layerUrl={generatedLayerUrl}
        bounds={bounds}
      />
    </div>
  );
}