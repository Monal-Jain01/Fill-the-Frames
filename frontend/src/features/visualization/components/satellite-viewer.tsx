"use client";

import React, { useImperativeHandle, forwardRef, useState } from 'react';
import { FrameDataResponse, ColorMap } from '../types';
import dynamic from 'next/dynamic';
import { LatLngBoundsExpression } from 'leaflet';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sid385-fill-the-frames.hf.space/api/v1";

const LeafletMap = dynamic(
  () => import('./leaflet-map'),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center animate-pulse bg-muted"><p className="text-muted-foreground">Loading Map...</p></div> }
);

interface SatelliteViewerProps {
  layerUrl?: string | null;
  bounds?: [number, number, number, number];
  colorMap?: ColorMap;
  data?: FrameDataResponse | null;
  onHover?: (e: any) => void;
  onUnhover?: () => void;
}

export interface SatelliteViewerRef {
  resetView: () => void;
}

export const SatelliteViewer = forwardRef<SatelliteViewerRef, SatelliteViewerProps>(
  ({ layerUrl, bounds }, ref) => {
    const [resetTrigger, setResetTrigger] = useState(0);

    useImperativeHandle(ref, () => ({
      resetView: () => {
        setResetTrigger(prev => prev + 1);
      }
    }));

    if (!layerUrl) {
       return (
         <div className="w-full h-full min-h-[400px] md:min-h-[600px] flex items-center justify-center border rounded-lg overflow-hidden bg-background">
           <p className="text-muted-foreground">No layer data available</p>
         </div>
       );
    }

    const fullUrl = layerUrl.startsWith('http') ? layerUrl : `${BASE_URL}${layerUrl}`;

    let mapBounds: LatLngBoundsExpression = [[-10, 40], [50, 110]];
    if (bounds && bounds.length === 4) {
      mapBounds = [[bounds[0], bounds[1]], [bounds[2], bounds[3]]];
    }

    return (
      <div className="relative w-full h-full min-h-[400px] md:min-h-[600px] border rounded-lg overflow-hidden bg-[#0a0a0a]">
        <LeafletMap url={fullUrl} resetTrigger={resetTrigger} bounds={bounds} />
      </div>
    );
  }
);
SatelliteViewer.displayName = 'SatelliteViewer';
