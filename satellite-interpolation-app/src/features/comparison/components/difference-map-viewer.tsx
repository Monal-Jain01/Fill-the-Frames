"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Layout, PlotRelayoutEvent } from 'plotly.js';
import { DifferenceMapData } from '../types';
import { DIFFERENCE_COLORMAP } from '../constants';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DifferenceMapViewerProps {
  differenceMap: DifferenceMapData;
  sharedLayout: Partial<Layout>;
  onRelayout: (eventData: Readonly<PlotRelayoutEvent>) => void;
  isFullscreen: boolean;
}

export function DifferenceMapViewer({ 
  differenceMap, 
  sharedLayout, 
  onRelayout,
  isFullscreen 
}: DifferenceMapViewerProps) {
  
  const heightClass = isFullscreen ? 'h-[80vh]' : 'h-[60vh] min-h-[500px]';

  const layout: Partial<Layout> = useMemo(() => ({
    autosize: true,
    margin: { l: 40, r: 10, b: 40, t: 10, pad: 4 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: { 
      title: { text: '' }, 
      showgrid: false, 
      zeroline: false,
      ...(sharedLayout.xaxis || {})
    },
    yaxis: { 
      title: { text: '' }, 
      showgrid: false, 
      zeroline: false, 
      autorange: 'reversed',
      ...(sharedLayout.yaxis || {})
    },
    dragmode: 'pan',
  }), [sharedLayout]);

  return (
    <div className={`w-full ${heightClass} border rounded-lg overflow-hidden bg-background relative flex flex-col`}>
      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur px-3 py-2 rounded text-sm font-semibold shadow-md border">
        {differenceMap.band} (T0.5)
      </div>

      <div className="flex-1 w-full relative">
        <Plot
          data={[
            {
              z: differenceMap.data,
              type: 'heatmap',
              colorscale: DIFFERENCE_COLORMAP,
              zmin: -Math.max(Math.abs(differenceMap.min), Math.abs(differenceMap.max)),
              zmax: Math.max(Math.abs(differenceMap.min), Math.abs(differenceMap.max)),
              showscale: true,
              colorbar: {
                title: 'Diff (K)',
                titleside: 'right',
                thickness: 15,
                len: 0.8
              }
            }
          ]}
          layout={layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          onRelayout={onRelayout}
          config={{
            responsive: true,
            scrollZoom: true,
            displayModeBar: false,
          }}
        />
      </div>
    </div>
  );
}
