"use client";

import React from 'react';
import { useComparison } from '../hooks/use-comparison';
import { ComparisonSummary } from './comparison-summary';
import { ComparisonToolbar } from './comparison-toolbar';
import { ComparisonGrid } from './comparison-grid';
import dynamic from 'next/dynamic';
const DifferenceMapViewer = dynamic(
  () => import('./difference-map-viewer').then(mod => mod.DifferenceMapViewer),
  { ssr: false, loading: () => <div className="w-full h-[500px] flex items-center justify-center animate-pulse bg-muted">Loading map...</div> }
);
import { DifferenceStatistics } from './difference-statistics';
import { ComparisonInsights } from './comparison-insights';
import { MetricsPreview } from './metrics-preview';
import { ComparisonEmptyState } from './comparison-empty-state';
import { motion } from 'framer-motion';

export function ComparisonDashboard() {
  const { 
    state, 
    mode, 
    setMode, 
    isFullscreen, 
    toggleFullscreen, 
    sharedLayout, 
    handleRelayout, 
    resetView,
    frames,
    differenceMap
  } = useComparison();

  if (state === 'empty') return <ComparisonEmptyState />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${isFullscreen ? 'fixed inset-4 z-50 bg-background overflow-auto' : ''}`}
    >
      {!isFullscreen && <ComparisonSummary mode={mode} />}
      
      <ComparisonToolbar 
        mode={mode}
        onModeChange={setMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onResetView={resetView}
      />

      <div className="pt-2">
        {mode === 'difference-map' ? (
          <DifferenceMapViewer 
            differenceMap={differenceMap}
            isFullscreen={isFullscreen}
          />
        ) : (
          <ComparisonGrid 
            mode={mode}
            frames={frames}
            sharedLayout={sharedLayout}
            onRelayout={handleRelayout}
            isFullscreen={isFullscreen}
          />
        )}
      </div>

      {!isFullscreen && mode === 'difference-map' && (
        <DifferenceStatistics differenceMap={differenceMap} />
      )}

      {!isFullscreen && (
        <>
          <ComparisonInsights differenceMap={differenceMap} />
          <MetricsPreview />
        </>
      )}

    </motion.div>
  );
}
