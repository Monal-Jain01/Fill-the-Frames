'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useValidationStore } from '@/store/validation-store';
import { visualizationClient } from '@/lib/api/visualization-client';

const LeafletCompareMap = dynamic(
  () => import('./leaflet-compare-map'),
  { ssr: false, loading: () => <div className="w-full h-[500px] flex items-center justify-center animate-pulse bg-muted"><p className="text-muted-foreground">Loading Comparison Map...</p></div> }
);

export function ValidationViewer() {
  const { artifactId, groundTruthFileId, selectedVariable, bounds: storeBounds } = useValidationStore();
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);

  const varName = selectedVariable || "C13";

  // Read authoritative bounds directly from the Orchestration metadata.
  useEffect(() => {
    if (storeBounds && storeBounds.bounds) {
      const b = storeBounds.bounds as [[number, number], [number, number]];
      // Extract from [[south, west], [north, east]]
      setBounds([b[0][0], b[0][1], b[1][0], b[1][1]]);
    }
  }, [storeBounds]);

  if (!artifactId || !groundTruthFileId) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 border rounded-lg">
        <p className="text-muted-foreground">Missing alignment data.</p>
      </div>
    );
  }

  const generatedUrl = visualizationClient.getLayerUrl(artifactId, varName, 0);
  const truthUrl = visualizationClient.getLayerUrl(groundTruthFileId, varName, 0);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-border shadow-md">
      <div className="relative h-[500px] w-full bg-[#0a0a0a]">
        <LeafletCompareMap leftUrl={truthUrl} rightUrl={generatedUrl} bounds={bounds} />
      </div>
      
      <div className="flex justify-between p-4 bg-muted/30 text-sm font-medium">
        <span className="text-muted-foreground">Ground Truth (Left)</span>
        <span className="text-primary">AI Generated (Right)</span>
      </div>
    </div>
  );
}