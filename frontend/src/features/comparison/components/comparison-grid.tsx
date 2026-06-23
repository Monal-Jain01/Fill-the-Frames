import React from 'react';
import { ComparisonMode, ComparisonFrame } from '../types';
import { ComparisonViewer } from './comparison-viewer';

import type { Layout, PlotRelayoutEvent } from 'plotly.js';

interface ComparisonGridProps {
  mode: ComparisonMode;
  frames: {
    t0: ComparisonFrame;
    t1: ComparisonFrame;
    t05: ComparisonFrame;
  };
  sharedLayout: Partial<Layout>;
  onRelayout: (eventData: Readonly<PlotRelayoutEvent>) => void;
  isFullscreen: boolean;
}

export function ComparisonGrid({ mode, frames, sharedLayout, onRelayout, isFullscreen }: ComparisonGridProps) {
  const heightClass = isFullscreen ? 'h-[80vh]' : 'h-[60vh] min-h-[400px]';

  if (mode === 'difference-map') return null; // Handled separately

  if (mode === 'side-by-side') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full ${heightClass}`}>
        <ComparisonViewer 
          frame={frames.t0} 
          sharedLayout={sharedLayout} 
          onRelayout={onRelayout} 
        />
        <ComparisonViewer 
          frame={frames.t05} 
          sharedLayout={sharedLayout} 
          onRelayout={onRelayout} 
        />
      </div>
    );
  }

  if (mode === 'three-frame') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 w-full ${heightClass}`}>
        <ComparisonViewer 
          frame={frames.t0} 
          sharedLayout={sharedLayout} 
          onRelayout={onRelayout} 
        />
        <ComparisonViewer 
          frame={frames.t05} 
          sharedLayout={sharedLayout} 
          onRelayout={onRelayout} 
        />
        <ComparisonViewer 
          frame={frames.t1} 
          sharedLayout={sharedLayout} 
          onRelayout={onRelayout} 
        />
      </div>
    );
  }

  if (mode === 'split-view') {
    // Split view conceptually is side-by-side without a gap for tight visual inspection
    return (
      <div className={`flex w-full ${heightClass}`}>
        <div className="flex-1 overflow-hidden border-r-2 border-primary relative">
          <ComparisonViewer 
            frame={frames.t0} 
            sharedLayout={sharedLayout} 
            onRelayout={onRelayout} 
            hideMetadata
          />
        </div>
        <div className="flex-1 overflow-hidden relative">
          <ComparisonViewer 
            frame={frames.t05} 
            sharedLayout={sharedLayout} 
            onRelayout={onRelayout} 
            hideMetadata
          />
        </div>
      </div>
    );
  }

  return null;
}
