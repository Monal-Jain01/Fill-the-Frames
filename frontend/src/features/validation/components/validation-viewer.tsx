'use client';

import React, { useState, useRef } from 'react';
import { FrameDataResponse } from '@/features/visualization/types';
import { SatelliteViewer } from '@/features/visualization/components/satellite-viewer';
import { VISUALIZATION_DEFAULTS } from '@/features/visualization/constants';
import { useValidationStore } from '@/store/validation-store';
import { visualizationClient } from '@/lib/api/visualization-client';

interface ValidationViewerProps {
  generatedData: FrameDataResponse | null;
  groundTruthData: FrameDataResponse | null;
}

export function ValidationViewer({ generatedData, groundTruthData }: ValidationViewerProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { artifactId, groundTruthFileId } = useValidationStore();

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }
    
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  if (!generatedData || !groundTruthData || !artifactId || !groundTruthFileId) {
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
      <div 
        ref={containerRef}
        className="relative h-[500px] w-full select-none cursor-ew-resize"
        onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
        onTouchMove={handleMouseMove}
        onClick={handleMouseMove}
      >
        {/* Layer 1: Ground Truth (Bottom) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <SatelliteViewer 
            layerUrl={truthUrl}
            colorMap={VISUALIZATION_DEFAULTS.initialColorMap}
          />
        </div>

        {/* Layer 2: Generated (Top, Clipped) */}
        <div 
          className="absolute inset-0 h-full pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <SatelliteViewer 
            layerUrl={generatedUrl}
            colorMap={VISUALIZATION_DEFAULTS.initialColorMap}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_5px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between p-4 bg-muted/30 text-sm font-medium">
        <span className="text-primary">AI Generated (T0.5)</span>
        <span className="text-muted-foreground">Ground Truth (Actual T0.5)</span>
      </div>
    </div>
  );
}