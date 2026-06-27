import { useState, useEffect } from 'react';
import type { PlotMouseEvent, PlotDatum } from 'plotly.js';
import { ColorMap, FrameType, PixelData } from '../types';
import { VISUALIZATION_DEFAULTS } from '../constants';
import { useInterpolationStore } from '@/store/interpolation-store';
import { visualizationClient } from '@/lib/api/visualization-client';

export function useVisualization(fileId?: string | null) {
  const store = useInterpolationStore();
  const { 
    selectedVariable, 
    selectedTimeIndex, 
    currentFrame: data, 
    visLoading, 
    visError: error 
  } = store;

  // Local UI state
  const [colorMap, setColorMap] = useState<ColorMap>(VISUALIZATION_DEFAULTS.initialColorMap);
  const [frameType, setFrameType] = useState<FrameType>(VISUALIZATION_DEFAULTS.initialFrame);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pixelData, setPixelData] = useState<PixelData>({
    x: null, y: null, value: null, colormapValue: null
  });

  const [layerUrl, setLayerUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);

  // Derived state string for UI compatibility
  const state = visLoading ? 'loading' : error ? 'error' : 'ready';

  useEffect(() => {
    // Trigger any completion-dependent effects when interpolation finishes
  }, [store.status]);

  useEffect(() => {
    if (!fileId) return;

    const fetchVariables = async () => {
      try {
        const res = await visualizationClient.getAvailableVariables(fileId);
        if (res.success && res.data.length > 0) {
          store.setVisState({ availableVariables: res.data });
          if (!selectedVariable) {
            store.setVisState({ selectedVariable: res.data[0] });
          }
        }
      } catch (err) {
        console.error("Failed to fetch variables", err);
      }
    };

    fetchVariables();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  useEffect(() => {
    if (!fileId || !selectedVariable) return;

    const fetchFrameAndImage = async () => {
      try {
        store.setVisState({ visLoading: true, visError: null });
        
        // Generate layer url
        const url = visualizationClient.getLayerUrl(fileId, selectedVariable, selectedTimeIndex);
        setLayerUrl(url);

        // Fetch bounds
        try {
          const boundsRes = await visualizationClient.getBounds(fileId, selectedVariable);
          if (boundsRes.success && boundsRes.data) {
             setBounds([
               boundsRes.data.min_lat,
               boundsRes.data.min_lon,
               boundsRes.data.max_lat,
               boundsRes.data.max_lon
             ]);
          }
        } catch(e) {
          console.warn("Could not load dynamic bounds", e);
        }

        // Backend only has images right now, getFrame might throw 404, we catch it silently.
        try {
          const res = await visualizationClient.getFrame(fileId, selectedVariable, selectedTimeIndex);
          if (res.success) {
            store.setVisState({ currentFrame: res.data, visLoading: false });
          }
        } catch(err) {
           store.setVisState({ visLoading: false }); // image layer takes priority
        }

      } catch (err: unknown) {
        store.setVisState({ 
          visError: err instanceof Error ? err.message : 'Failed to load frame',
          visLoading: false 
        });
      }
    };

    fetchFrameAndImage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, selectedVariable, selectedTimeIndex]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleHover = (event: Readonly<PlotMouseEvent>) => {
    if (event.points && event.points[0]) {
      const pt = event.points[0] as PlotDatum & { z?: number };
      setPixelData({
        x: pt.x as number,
        y: pt.y as number,
        value: pt.z !== undefined ? Number(pt.z) : null,
        colormapValue: null 
      });
    }
  };

  const handleUnhover = () => {
    setPixelData({ x: null, y: null, value: null, colormapValue: null });
  };

  return {
    state,
    data,
    colorMap,
    setColorMap,
    frameType,
    setFrameType,
    isFullscreen,
    toggleFullscreen,
    pixelData,
    handleHover,
    handleUnhover,
    // Add these for UI to change variable/time
    selectedVariable,
    setSelectedVariable: (v: string) => store.setVisState({ selectedVariable: v }),
    selectedTimeIndex,
    setSelectedTimeIndex: (t: number) => store.setVisState({ selectedTimeIndex: t }),
    availableVariables: store.availableVariables,
    layerUrl,
    bounds
  };
}