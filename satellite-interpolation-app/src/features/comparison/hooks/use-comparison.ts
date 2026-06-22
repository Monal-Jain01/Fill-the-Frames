import { useState, useCallback } from 'react';
import type { Layout, PlotRelayoutEvent } from 'plotly.js';
import { syncPlotlyRelayout } from '@/utils/plotly-events';
import { ComparisonMode, ComparisonState } from '../types';
import { DEFAULT_COMPARISON_MODE } from '../constants';
import { MOCK_COMP_T0, MOCK_COMP_T1, MOCK_COMP_T05, MOCK_DIFFERENCE_MAP } from '../mock/data';

export function useComparison() {
  const [state] = useState<ComparisonState>('ready');
  const [mode, setMode] = useState<ComparisonMode>(DEFAULT_COMPARISON_MODE);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Shared layout state for linked pan/zoom
  const [sharedLayout, setSharedLayout] = useState<Partial<Layout>>({});

  const handleRelayout = useCallback((eventData: Readonly<PlotRelayoutEvent>) => {
    syncPlotlyRelayout(eventData, setSharedLayout);
  }, []);

  const resetView = useCallback(() => {
    setSharedLayout({
      xaxis: { autorange: true },
      yaxis: { autorange: true },
    });
  }, []);

  return {
    state,
    mode,
    setMode,
    isFullscreen,
    toggleFullscreen: () => setIsFullscreen(!isFullscreen),
    sharedLayout,
    handleRelayout,
    resetView,
    frames: {
      t0: MOCK_COMP_T0,
      t1: MOCK_COMP_T1,
      t05: MOCK_COMP_T05,
    },
    differenceMap: MOCK_DIFFERENCE_MAP,
  };
}
