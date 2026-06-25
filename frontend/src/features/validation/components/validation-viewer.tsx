'use client';

import React from 'react';
import { ReactCompareSlider } from 'react-compare-slider';
import { FrameDataResponse } from '@/features/visualization/types';
import { SatelliteViewer } from '@/features/visualization/components/satellite-viewer';
import { VISUALIZATION_DEFAULTS } from '@/features/visualization/constants';

interface ValidationViewerProps {
  generatedData: FrameDataResponse | null;
  groundTruthData: FrameDataResponse | null;
}

export function ValidationViewer({ generatedData, groundTruthData }: ValidationViewerProps) {
  if (!generatedData || !groundTruthData) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/10 border rounded-lg">
        <p className="text-muted-foreground">Missing alignment data.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-border shadow-md">
      <ReactCompareSlider
        itemOne={
          <div className="w-full h-full">
            <SatelliteViewer 
              data={generatedData}
              colorMap={VISUALIZATION_DEFAULTS.initialColorMap}
              onHover={() => {}}
              onUnhover={() => {}}
            />
          </div>
        }
        itemTwo={
          <div className="w-full h-full">
            <SatelliteViewer 
              data={groundTruthData}
              colorMap={VISUALIZATION_DEFAULTS.initialColorMap}
              onHover={() => {}}
              onUnhover={() => {}}
            />
          </div>
        }
        className="h-[500px] w-full"
      />
      <div className="flex justify-between p-4 bg-muted/30 text-sm font-medium">
        <span className="text-primary">AI Generated (T0.5)</span>
        <span className="text-muted-foreground">Ground Truth (Actual T0.5)</span>
      </div>
    </div>
  );
}
