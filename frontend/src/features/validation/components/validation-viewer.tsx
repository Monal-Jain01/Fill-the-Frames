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
  const { artifactId, groundTruthFileId, selectedVariable } = useValidationStore();
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);
  const [isBoundsLoading, setIsBoundsLoading] = useState(true);

  const varName = selectedVariable || "C13";

  useEffect(() => {
    if (artifactId) {
      setIsBoundsLoading(true);
      visualizationClient.getBounds(artifactId, varName).then(res => {
        if (res.success && res.data && res.data.bounds) {
          const [[south, west], [north, east]] = res.data.bounds;
          setBounds([south, west, north, east]);
        }
      }).catch(console.error)
      .finally(() => setIsBoundsLoading(false));
    }
  }, [artifactId, varName]);

  if (!artifactId || !groundTruthFileId) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 border rounded-lg">
        <p className="text-muted-foreground">Missing alignment data.</p>
      </div>
    );
  }

  if (isBoundsLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto h-[500px] flex flex-col gap-4 items-center justify-center bg-muted/10 border rounded-lg animate-pulse">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Fetching geographic coordinates...</p>
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