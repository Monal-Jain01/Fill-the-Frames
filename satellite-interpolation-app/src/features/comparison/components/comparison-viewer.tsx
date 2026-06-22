"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Layout, PlotRelayoutEvent } from 'plotly.js';
import { ComparisonFrame } from '../types';
import { formatDate } from '@/features/metadata/utils/formatters';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ComparisonViewerProps {
  frame: ComparisonFrame;
  sharedLayout: Partial<Layout>;
  onRelayout: (eventData: Readonly<PlotRelayoutEvent>) => void;
  colormap?: string;
  hideMetadata?: boolean;
}

export function ComparisonViewer({ 
  frame, 
  sharedLayout, 
  onRelayout,
  colormap = 'Inferno',
  hideMetadata = false
}: ComparisonViewerProps) {
  
  const layout: Partial<Layout> = useMemo(() => ({
    autosize: true,
    margin: { l: 20, r: 10, b: 20, t: 10, pad: 4 },
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
    <div className="flex flex-col h-full bg-muted/5 border rounded-lg overflow-hidden relative">
      <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold shadow-sm border">
        {frame.type}
      </div>
      
      <div className="flex-1 w-full relative min-h-[300px]">
        <Plot
          data={[
            {
              z: frame.data,
              type: 'heatmap',
              colorscale: colormap,
              zmin: frame.min,
              zmax: frame.max,
              showscale: false, // Hide individual color scales to save space
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

      {!hideMetadata && (
        <div className="p-3 bg-muted/20 border-t text-xs grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase text-[10px]">Timestamp</span>
            <span className="font-medium truncate">{formatDate(frame.timestamp)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase text-[10px]">Band</span>
            <span className="font-medium truncate">{frame.band}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase text-[10px]">Resolution</span>
            <span className="font-medium truncate">{frame.resolution}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase text-[10px]">Dimensions</span>
            <span className="font-medium truncate">{frame.dimensions.join(' × ')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
