import { useState, useEffect } from 'react';
import type { PlotMouseEvent, PlotDatum } from 'plotly.js';
import { VisualizationState, ColorMap, MockImageData, FrameType, PixelData } from '../types';
import { VISUALIZATION_DEFAULTS } from '../constants';
import { mockFrameData } from '../mock/data';

export function useVisualization() {
  const [state, setState] = useState<VisualizationState>('loading');
  const [data, setData] = useState<MockImageData | null>(null);
  
  const [colorMap, setColorMap] = useState<ColorMap>(VISUALIZATION_DEFAULTS.initialColorMap);
  const [frameType, setFrameType] = useState<FrameType>(VISUALIZATION_DEFAULTS.initialFrame);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [pixelData, setPixelData] = useState<PixelData>({
    x: null,
    y: null,
    value: null,
    colormapValue: null
  });

  useEffect(() => {
    // Simulate async data loading
    const loadData = async () => {
      try {
        setState('loading');
        await new Promise(res => setTimeout(res, 800));
        
        // In the future, this would fetch specific frame type based on `frameType` state
        setData(mockFrameData);
        setState('ready');
      } catch {
        setState('error');
      }
    };
    
    loadData();
  }, [frameType]); // Reload if frameType changes

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleHover = (event: Readonly<PlotMouseEvent>) => {
    if (event.points && event.points[0]) {
      const pt = event.points[0] as PlotDatum & { z?: number };
      setPixelData({
        x: pt.x as number,
        y: pt.y as number,
        value: pt.z !== undefined ? Number(pt.z) : null,
        colormapValue: null // We could map this using plotly config later if needed
      });
    }
  };

  const handleUnhover = () => {
    setPixelData({
      x: null,
      y: null,
      value: null,
      colormapValue: null
    });
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
    handleUnhover
  };
}
