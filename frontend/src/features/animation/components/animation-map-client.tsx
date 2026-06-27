"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, ImageOverlay, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngBoundsExpression } from "leaflet";
import { useAnimationStore } from "@/store/animation-store";

// South Asia / India approximate bounds for INSAT
const DEFAULT_BOUNDS: LatLngBoundsExpression = [
  [-10, 45],
  [45, 100],
];

// Helper to fit bounds when they change
function MapController({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { animate: true });
  }, [map, bounds]);
  return null;
}

export default function AnimationMapClient() {
  const { frames, currentFrameIndex, selectedVariable } = useAnimationStore();
  
  // Filter frames by selected variable
  const filteredFrames = selectedVariable 
    ? frames.filter(f => f.variable === selectedVariable)
    : frames;
    
  // Since index might be out of bounds for filtered frames, bound it
  const safeIndex = currentFrameIndex < filteredFrames.length ? currentFrameIndex : 0;
  const currentFrame = filteredFrames[safeIndex];

  const bounds = (currentFrame?.bounds as LatLngBoundsExpression) || DEFAULT_BOUNDS;

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
      {filteredFrames.length === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm font-medium">Waiting for sequence data...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        bounds={bounds}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {currentFrame?.imageUrl && (
          <ImageOverlay
            url={currentFrame.imageUrl}
            bounds={bounds}
            opacity={0.8}
            zIndex={10}
          />
        )}
        
        <MapController bounds={bounds} />
      </MapContainer>
    </div>
  );
}
