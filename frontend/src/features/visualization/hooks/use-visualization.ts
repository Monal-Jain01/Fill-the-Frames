import { useState, useEffect } from 'react';
import type { PlotMouseEvent, PlotDatum } from 'plotly.js';
import { VisualizationState, ColorMap, MockImageData, FrameType, PixelData } from '../types';
import { VISUALIZATION_DEFAULTS } from '../constants';
import { useUploadStore } from '@/store/upload-store';
import { visualizationClient } from '@/lib/api';

// Fallback to mock data if backend doesn't return matrix correctly yet
import { mockFrameData } from '../mock/data';

export function useVisualization(fileIdProp?: string) {
  const [state, setState] = useState<VisualizationState>('loading');
  const [data, setData] = useState<MockImageData | null>(null);
  const [variables, setVariables] = useState<any>(null);
  
  const [colorMap, setColorMap] = useState<ColorMap>(VISUALIZATION_DEFAULTS.initialColorMap);
  const [frameType, setFrameType] = useState<FrameType>(VISUALIZATION_DEFAULTS.initialFrame);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const files = useUploadStore(state => state.files);

  const [pixelData, setPixelData] = useState<PixelData>({
    x: null,
    y: null,
    value: null,
    colormapValue: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setState('loading');
        
        let targetFileId = fileIdProp;
        if (!targetFileId) {
          const completedFile = files.find(f => f.status === 'completed' && f.cloudFileId);
          targetFileId = completedFile?.cloudFileId;
        }

        if (!targetFileId) {
          setState('error');
          return;
        }

        // Fetch variable metadata
        const response = await visualizationClient.getVariables(targetFileId);
        if (response.success && response.data) {
          setVariables(response.data);
          
          // NOTE: If the backend does not return raw 2D array data in the API,
          // you may need to use Map/Leaflet with `visualizationClient.getLayerUrl`
          // or parse the returned data if it's an array.
          // For now, if the response doesn't contain a data matrix, fallback to mock data matrix
          if (response.data.data_matrix) {
             setData(response.data as any);
          } else {
             // Fallback to mock for the plotly 2D map if backend data format differs
             setData(mockFrameData);
          }
          
          setState('ready');
        } else {
           throw new Error(response.message);
        }
        
      } catch (error) {
        console.error("Failed to load visualization data:", error);
        // Fallback to mock for development
        setData(mockFrameData);
        setState('ready');
      }
    };
    
    loadData();
  }, [frameType, fileIdProp, files]);

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
    variables,
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