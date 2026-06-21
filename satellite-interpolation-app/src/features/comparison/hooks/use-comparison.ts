import { useState, useCallback } from 'react';
import { ComparisonMode, ComparisonState } from '../types';
import { DEFAULT_COMPARISON_MODE } from '../constants';
import { MOCK_COMP_T0, MOCK_COMP_T1, MOCK_COMP_T05, MOCK_DIFFERENCE_MAP } from '../mock/data';

export function useComparison() {
  const [state, setState] = useState<ComparisonState>('ready');
  const [mode, setMode] = useState<ComparisonMode>(DEFAULT_COMPARISON_MODE);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Shared layout state for linked pan/zoom
  const [sharedLayout, setSharedLayout] = useState<{
    'xaxis.range[0]'?: number;
    'xaxis.range[1]'?: number;
    'yaxis.range[0]'?: number;
    'yaxis.range[1]'?: number;
  }>({});

  const handleRelayout = useCallback((eventData: any) => {
    // Check if the event contains axis range changes
    if (
      eventData['xaxis.range[0]'] !== undefined ||
      eventData['xaxis.autorange'] === true
    ) {
      setSharedLayout(eventData);
    }
  }, []);

  const resetView = useCallback(() => {
    setSharedLayout({
      'xaxis.autorange': true,
      'yaxis.autorange': true,
    } as any);
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
