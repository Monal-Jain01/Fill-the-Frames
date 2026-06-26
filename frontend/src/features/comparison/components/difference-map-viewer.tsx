"use client";

import React, { useEffect, useRef } from 'react';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DifferenceMapData } from '../types';
import { BASE_URL } from '@/lib/api/base-client';

interface DifferenceMapViewerProps {
  differenceMap: DifferenceMapData;
  errorMapUrl?: string | null;
  /** @deprecated kept for backwards-compat with Plotly-era callers */
  sharedLayout?: Record<string, unknown>;
  /** @deprecated kept for backwards-compat with Plotly-era callers */
  onRelayout?: (...args: unknown[]) => void;
  isFullscreen: boolean;
}

/** Auto-fit the map to the image bounds whenever the URL changes */
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  const boundsRef = useRef(bounds);

  useEffect(() => {
    boundsRef.current = bounds;
    // @ts-ignore - Leaflet types are notoriously picky about bounds arrays
    map.fitBounds(L.latLngBounds(bounds), { animate: false });
  }, [map, bounds]);

  return null;
}

export function DifferenceMapViewer({
  differenceMap,
  errorMapUrl,
  isFullscreen,
}: DifferenceMapViewerProps) {
  const heightClass = isFullscreen ? 'h-[80vh]' : 'h-[60vh] min-h-[500px]';

  const fullUrl = errorMapUrl
    ? (errorMapUrl.startsWith('http') ? errorMapUrl : `${BASE_URL}${errorMapUrl}`)
    : null;

  const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

  return (
    <div className={`w-full ${heightClass} border rounded-lg overflow-hidden bg-background relative flex flex-col`}>
      <div className="absolute top-4 left-4 z-[1000] bg-background/90 backdrop-blur px-3 py-2 rounded text-sm font-semibold shadow-md border">
        {differenceMap.band} (Error/Diff Map)
      </div>

      {fullUrl ? (
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          className="flex-1 w-full z-0 bg-[#0a0a0a]"
          zoomControl={true}
          minZoom={-2}
          maxZoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <FitBounds bounds={bounds} />
          <ImageOverlay
            url={fullUrl}
            bounds={bounds}
            opacity={1}
            // @ts-ignore — crossOrigin is valid on ImageOverlay
            crossOrigin="anonymous"
          />
        </MapContainer>
      ) : (
        <div className="flex-1 w-full flex items-center justify-center bg-background/50">
          <div className="text-muted-foreground flex flex-col items-center">
            <span>Error map layer not available.</span>
            <span className="text-xs mt-1 opacity-70">Ensure 2 files are uploaded and processed.</span>
          </div>
        </div>
      )}
    </div>
  );
}
