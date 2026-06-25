"use client";

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { FrameDataResponse, ColorMap } from '../types';
import { COLOR_MAPS } from '../constants';
import { useTheme } from 'next-themes';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

import type { PlotMouseEvent } from 'plotly.js';

interface SatelliteViewerProps {
  data: FrameDataResponse;
  colorMap: ColorMap;
  onHover: (e: Readonly<PlotMouseEvent>) => void;
  onUnhover: () => void;
}

export interface SatelliteViewerRef {
  resetView: () => void;
}

export const SatelliteViewer = forwardRef<SatelliteViewerRef, SatelliteViewerProps>(
  ({ data, colorMap, onHover, onUnhover }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || true; // Force dark theme styling per requirements if needed
    const revisionRef = useRef(0);

    useImperativeHandle(ref, () => ({
      resetView: () => {
        revisionRef.current += 1; // Trigger a re-render in Plotly to reset view
      }
    }));

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      margin: { l: 40, r: 10, b: 40, t: 10, pad: 4 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: isDark ? '#e2e8f0' : '#1e293b' },
      xaxis: { title: { text: 'X' }, showgrid: false, zeroline: false },
      yaxis: { title: { text: 'Y' }, showgrid: false, zeroline: false, autorange: 'reversed' },
      dragmode: 'pan',
    };

    return (
      <div className="w-full h-full min-h-[400px] md:min-h-[600px] border rounded-lg overflow-hidden bg-background">
        <Plot
          data={[
            {
              z: data.z,
              type: 'heatmap',
              colorscale: COLOR_MAPS[colorMap],
              zmin: data.min,
              zmax: data.max,
              hoverinfo: 'x+y+z',
              showscale: true,
            }
          ]}
          layout={layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          onHover={onHover}
          onUnhover={onUnhover}
          revision={revisionRef.current}
          config={{
            responsive: true,
            scrollZoom: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
            displaylogo: false,
          }}
        />
      </div>
    );
  }
);
SatelliteViewer.displayName = 'SatelliteViewer';
