"use client";

import React, { useEffect } from 'react';
import { MapContainer, ImageOverlay, useMap, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  url: string;
  resetTrigger: number;
  bounds?: [number, number, number, number];
}

function ResetControl({ resetTrigger, bounds }: { resetTrigger: number, bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    // @ts-expect-error Leaflet types are notoriously picky about bounds arrays
    map.fitBounds(L.latLngBounds(bounds), { animate: true });
  }, [resetTrigger, map, bounds]);
  return null;
}

export default function LeafletMap({ url, resetTrigger, bounds }: LeafletMapProps) {
  // Real geographic bounds if available, else a rough bounding box for India as fallback
  const isValidBounds = bounds && Array.isArray(bounds) && bounds.length === 4 && bounds.every(n => typeof n === 'number' && !isNaN(n));
  const mapBounds: L.LatLngBoundsExpression = isValidBounds 
    ? [[bounds[0], bounds[1]], [bounds[2], bounds[3]]]
    : [[8.4, 68.7], [37.6, 97.25]];

  return (
    <MapContainer 
      bounds={mapBounds} 
      className="w-full h-full z-0 bg-[#0a0a0a]"
      zoomControl={true}
      minZoom={2}
      maxZoom={10}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      <ImageOverlay
        url={url}
        bounds={mapBounds}
        opacity={0.8}
        crossOrigin="anonymous"
        zIndex={10}
      />

      <ResetControl resetTrigger={resetTrigger} bounds={mapBounds} />
    </MapContainer>
  );
}