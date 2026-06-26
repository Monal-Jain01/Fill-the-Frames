'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useValidationStore } from '@/store/validation-store';
import { visualizationClient } from '@/lib/api/visualization-client';

const LeafletCompareMap = dynamic(
  () => import('./leaflet-compare-map'),
  { ssr: false, loading: () => <div className="w-full h-[500px] flex items-center justify-center animate-pulse bg-muted"><p className="text-muted-foreground">Loading Comparison Map...</p></div> }
);

export function ValidationViewer() {
  const { artifactId, groundTruthFileId } = useValidationStore();

  if (!artifactId || !groundTruthFileId) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 border rounded-lg">
        <p className="text-muted-foreground">Missing alignment data.</p>
      </div>
    );
  }

  const generatedUrl = visualizationClient.getLayerUrl(artifactId, "C13", 0);
  const truthUrl = visualizationClient.getLayerUrl(groundTruthFileId, "C13", 0);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-border shadow-md">
      <div className="relative h-[500px] w-full bg-[#0a0a0a]">
        <LeafletCompareMap leftUrl={truthUrl} rightUrl={generatedUrl} />
      </div>
      
      <div className="flex justify-between p-4 bg-muted/30 text-sm font-medium">
        <span className="text-muted-foreground">Ground Truth (Left)</span>
        <span className="text-primary">AI Generated (Right)</span>
      </div>
    </div>
  );
}