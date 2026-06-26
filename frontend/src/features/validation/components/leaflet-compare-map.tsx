"use client";

import React, { useEffect, useRef } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// We have to ignore TS for this plugin since it usually lacks updated types
// @ts-ignore
import 'leaflet-side-by-side';

interface LeafletCompareMapProps {
  leftUrl: string;
  rightUrl: string;
}

function SideBySideControl({ leftUrl, rightUrl }: { leftUrl: string, rightUrl: string }) {
  const map = useMap();
  const controlRef = useRef<any>(null);
  
  useEffect(() => {
    const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];
    map.fitBounds(bounds);

    const leftLayer = L.imageOverlay(leftUrl, bounds, { opacity: 1, crossOrigin: "anonymous" }).addTo(map);
    const rightLayer = L.imageOverlay(rightUrl, bounds, { opacity: 1, crossOrigin: "anonymous" }).addTo(map);

    // @ts-ignore
    if (L.control.sideBySide) {
       // @ts-ignore
       controlRef.current = L.control.sideBySide(leftLayer, rightLayer).addTo(map);
    }

    return () => {
      if (controlRef.current) {
         map.removeControl(controlRef.current);
      }
      map.removeLayer(leftLayer);
      map.removeLayer(rightLayer);
    };
  }, [map, leftUrl, rightUrl]);

  return null;
}

export default function LeafletCompareMap({ leftUrl, rightUrl }: LeafletCompareMapProps) {
  const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

  return (
    <MapContainer 
      crs={L.CRS.Simple}
      bounds={bounds} 
      className="w-full h-full z-0 bg-[#0a0a0a]"
      zoomControl={true}
      minZoom={-2}
      maxZoom={4}
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
    >
      <SideBySideControl leftUrl={leftUrl} rightUrl={rightUrl} />
    </MapContainer>
  );
}