"use client";

import React, { useRef } from 'react';
import { useVisualization } from '../hooks/use-visualization';
import { VisualizationSummaryCards } from './visualization-summary-cards';
import { VisualizationToolbar } from './visualization-toolbar';
import { SatelliteViewer, SatelliteViewerRef } from './satellite-viewer';
import { PixelInspector } from './pixel-inspector';
import { FrameHistogram } from './frame-histogram';
import { FrameInfoPanel } from './frame-info-panel';
import { VisualizationEmptyState } from './visualization-empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export function VisualizationDashboard() {
  const {
    state,
    data,
    colorMap,
    setColorMap,
    isFullscreen,
    toggleFullscreen,
    pixelData,
    handleHover,
    handleUnhover
  } = useVisualization();

  const viewerRef = useRef<SatelliteViewerRef>(null);

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.resetView();
    }
  };

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[400px] md:h-[600px] w-full" />
      </div>
    );
  }

  if (state === 'error') {
    return <VisualizationEmptyState message="Error Loading Frame" description="There was a problem loading the satellite imagery. Please try again." />;
  }

  if (state === 'empty' || !data) {
    return <VisualizationEmptyState />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${isFullscreen ? 'fixed inset-4 z-50 bg-background overflow-auto' : ''}`}
    >
      {!isFullscreen && <VisualizationSummaryCards info={data.info} />}
      
      <VisualizationToolbar 
        colorMap={colorMap}
        onColorMapChange={setColorMap}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onResetView={handleResetView}
      />
      
      <div className={isFullscreen ? 'h-[80vh]' : 'h-full'}>
        <SatelliteViewer 
          ref={viewerRef}
          data={data}
          colorMap={colorMap}
          onHover={handleHover}
          onUnhover={handleUnhover}
        />
      </div>

      {!isFullscreen && (
        <>
          <PixelInspector pixel={pixelData} />
          <FrameHistogram data={data} />
          <FrameInfoPanel info={data.info} />
        </>
      )}
    </motion.div>
  );
}
