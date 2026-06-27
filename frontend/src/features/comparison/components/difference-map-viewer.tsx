"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, ImageOverlay, useMap, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DifferenceMapData } from '../types';
import { BASE_URL } from '@/lib/api/base-client';
import { visualizationClient } from '@/lib/api/visualization-client';

interface DifferenceMapViewerProps {
  differenceMap: DifferenceMapData;
  errorMapUrl?: string | null;
  /** @deprecated kept for backwards-compat with Plotly-era callers */
  sharedLayout?: Record<string, unknown>;
  /** @deprecated kept for backwards-compat with Plotly-era callers */
  onRelayout?: (...args: unknown[]) => void;
  isFullscreen: boolean;
  fileIdForBounds?: string | null;
  variable?: string;
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
  fileIdForBounds,
  variable,
}: DifferenceMapViewerProps) {
  const heightClass = isFullscreen ? 'h-[80vh]' : 'h-[60vh] min-h-[500px]';
  const [boundsData, setBoundsData] = useState<[number, number, number, number] | undefined>(undefined);
  const [isBoundsLoading, setIsBoundsLoading] = useState(!!fileIdForBounds);

  useEffect(() => {
    if (fileIdForBounds) {
      setIsBoundsLoading(true);
      visualizationClient.getBounds(fileIdForBounds, variable || "C13").then(res => {
        if (res.success && res.data && res.data.bounds) {
          const [[south, west], [north, east]] = res.data.bounds;
          setBoundsData([south, west, north, east]);
        }
      }).catch(console.error)
      .finally(() => setIsBoundsLoading(false));
    } else {
      setIsBoundsLoading(false);
    }
  }, [fileIdForBounds, variable]);

  const fullUrl = errorMapUrl
    ? (errorMapUrl.startsWith('http') ? errorMapUrl : `${BASE_URL}${errorMapUrl}`)
    : null;

  if (isBoundsLoading) {
    return (
      <div className={`w-full ${heightClass} flex flex-col gap-4 items-center justify-center bg-muted/10 border rounded-lg animate-pulse`}>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Fetching geographic coordinates...</p>
      </div>
    );
  }

  const isValidBounds = boundsData && Array.isArray(boundsData) && boundsData.length === 4 && boundsData.every(n => typeof n === 'number' && !isNaN(n));
  const mapBounds: L.LatLngBoundsExpression = isValidBounds 
    ? [[boundsData[0], boundsData[1]], [boundsData[2], boundsData[3]]]
    : [[8.4, 68.7], [37.6, 97.25]];

  return (
    <div className={`w-full ${heightClass} border rounded-lg overflow-hidden bg-background relative flex flex-col`}>
      <div className="absolute top-4 left-4 z-[1000] bg-background/90 backdrop-blur px-3 py-2 rounded text-sm font-semibold shadow-md border">
        {differenceMap.band} (Error/Diff Map)
      </div>

      {fullUrl ? (
        <MapContainer
          bounds={mapBounds}
          maxBounds={mapBounds}
          maxBoundsViscosity={1.0}
          className="flex-1 w-full z-0 bg-[#0a0a0a]"
          zoomControl={true}
          minZoom={3}
          maxZoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <FitBounds bounds={mapBounds} />
          <ImageOverlay
            url={fullUrl}
            bounds={mapBounds}
            opacity={0.8}
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
