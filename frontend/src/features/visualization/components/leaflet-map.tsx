"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngBoundsExpression } from 'leaflet';

interface LeafletMapProps {
  url: string;
  bounds: LatLngBoundsExpression;
  resetTrigger: number;
}

function ResetControl({ bounds, resetTrigger }: { bounds: LatLngBoundsExpression, resetTrigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, resetTrigger, map]);
  return null;
}

export default function LeafletMap({ url, bounds, resetTrigger }: LeafletMapProps) {
  return (
    <MapContainer 
      bounds={bounds} 
      className="w-full h-full z-0"
      zoomControl={true}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <ImageOverlay
        url={url}
        bounds={bounds}
        opacity={0.85}
        crossOrigin="anonymous"
        zIndex={10}
      />

      <ResetControl bounds={bounds} resetTrigger={resetTrigger} />
    </MapContainer>
  );
}